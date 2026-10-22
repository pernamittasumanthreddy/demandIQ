import io
import csv
import re
from datetime import datetime
from decimal import Decimal
import pandas as pd
from django.db import transaction
from django.utils import timezone
from .models import SalesImport, SalesImportError, ImportStatus
from apps.sales.models import SalesTransaction, SalesTransactionItem, PaymentMethod
from apps.catalog.models import Product, ProductCategory
from apps.inventory.services import InventoryService
from apps.inventory.models import MovementType

class ImportValidationEngine:
    @staticmethod
    def infer_column_mapping(columns):
        """
        Heuristically maps incoming spreadsheet/CSV headers to standardized schema fields.
        """
        mapping = {}
        for col in columns:
            col_clean = str(col).strip().lower().replace('_', ' ').replace('-', ' ')
            
            if not mapping.get('date') and any(k in col_clean for k in ['date', 'time', 'timestamp', 'txn dt']):
                mapping['date'] = col
            elif not mapping.get('invoice') and any(k in col_clean for k in ['invoice', 'bill', 'receipt', 'order id', 'txn id', 'bill no']):
                mapping['invoice'] = col
            elif not mapping.get('sku') and any(k in col_clean for k in ['sku', 'code', 'barcode', 'item id', 'product id']):
                mapping['sku'] = col
            elif not mapping.get('product_name') and any(k in col_clean for k in ['name', 'product', 'item', 'description', 'title']):
                mapping['product_name'] = col
            elif not mapping.get('quantity') and any(k in col_clean for k in ['qty', 'quantity', 'units', 'sold', 'volume', 'count']):
                mapping['quantity'] = col
            elif not mapping.get('price') and any(k in col_clean for k in ['price', 'rate', 'mrp', 'amount', 'unit price', 'selling']):
                mapping['price'] = col
            elif not mapping.get('discount') and any(k in col_clean for k in ['disc', 'discount', 'concession', 'offer']):
                mapping['discount'] = col

        return mapping

    @classmethod
    def parse_and_validate(cls, import_obj: SalesImport, file_content_bytes: bytes):
        """
        Parses uploaded bytes, auto-detects schema, validates data quality, and saves errors.
        """
        import_obj.status = ImportStatus.VALIDATING
        import_obj.save()

        try:
            if import_obj.filename.lower().endswith('.xlsx') or import_obj.filename.lower().endswith('.xls'):
                df = pd.read_excel(io.BytesIO(file_content_bytes))
            else:
                # Attempt CSV decoding (utf-8, latin1)
                try:
                    df = pd.read_csv(io.BytesIO(file_content_bytes))
                except UnicodeDecodeError:
                    df = pd.read_csv(io.BytesIO(file_content_bytes), encoding='latin1')

            df.columns = [str(c).strip() for c in df.columns]
            mapping = cls.infer_column_mapping(df.columns)
            import_obj.column_mapping = mapping

            # Store preview sample (first 5 rows)
            import_obj.sample_preview = df.head(5).fillna('').to_dict(orient='records')
            import_obj.total_rows = len(df)

            # Clear any previous errors
            import_obj.errors.all().delete()
            errors_to_create = []

            date_col = mapping.get('date')
            qty_col = mapping.get('quantity')
            price_col = mapping.get('price')
            sku_col = mapping.get('sku') or mapping.get('product_name')

            valid_count = 0
            for index, row in df.iterrows():
                row_idx = index + 2  # 1-based index plus header
                row_errors = []

                # Date validation
                if not date_col or pd.isna(row.get(date_col)):
                    row_errors.append(('date', str(row.get(date_col, '')), 'Missing sales transaction date'))
                else:
                    try:
                        pd.to_datetime(row[date_col])
                    except Exception:
                        row_errors.append((date_col, str(row[date_col]), 'Invalid date format'))

                # Qty validation
                if not qty_col or pd.isna(row.get(qty_col)):
                    row_errors.append(('quantity', '', 'Quantity is required'))
                else:
                    try:
                        qty_val = float(row[qty_col])
                        if qty_val <= 0:
                            row_errors.append((qty_col, str(row[qty_col]), 'Quantity must be greater than zero'))
                    except (ValueError, TypeError):
                        row_errors.append((qty_col, str(row[qty_col]), 'Quantity must be numeric'))

                # Price validation
                if not price_col or pd.isna(row.get(price_col)):
                    row_errors.append(('price', '', 'Unit price is required'))
                else:
                    try:
                        price_val = float(row[price_col])
                        if price_val < 0:
                            row_errors.append((price_col, str(row[price_col]), 'Price cannot be negative'))
                    except (ValueError, TypeError):
                        row_errors.append((price_col, str(row[price_col]), 'Price must be numeric'))

                # Product identification
                if not sku_col or pd.isna(row.get(sku_col)) or str(row[sku_col]).strip() == "":
                    row_errors.append(('product', '', 'Product SKU or Name identifier is missing'))

                if row_errors:
                    for col_name, val, msg in row_errors:
                        errors_to_create.append(
                            SalesImportError(
                                sales_import=import_obj,
                                row_number=row_idx,
                                column_name=col_name,
                                invalid_value=val[:200],
                                error_message=msg
                            )
                        )
                else:
                    valid_count += 1

            if errors_to_create:
                SalesImportError.objects.bulk_create(errors_to_create)
                import_obj.status = ImportStatus.HAS_ERRORS
            else:
                import_obj.status = ImportStatus.VALIDATED

            import_obj.valid_rows = valid_count
            import_obj.error_rows = len(df) - valid_count
            import_obj.error_summary = [
                {'row': e.row_number, 'column': e.column_name, 'error': e.error_message}
                for e in errors_to_create[:50]
            ]
            import_obj.save()
            return import_obj, df

        except Exception as e:
            import_obj.status = ImportStatus.FAILED
            import_obj.error_summary = [{'error': str(e)}]
            import_obj.save()
            raise e

    @classmethod
    @transaction.atomic
    def process_import(cls, import_obj: SalesImport, df: pd.DataFrame, user=None):
        """
        Executes idempotent insertion of validated rows into SalesTransaction and SalesTransactionItem.
        Auto-registers missing catalog products if needed with default margins.
        """
        import_obj.status = ImportStatus.PROCESSING
        import_obj.save()

        mapping = import_obj.column_mapping
        date_col = mapping.get('date')
        inv_col = mapping.get('invoice')
        sku_col = mapping.get('sku')
        name_col = mapping.get('product_name') or sku_col
        qty_col = mapping.get('quantity')
        price_col = mapping.get('price')
        disc_col = mapping.get('discount')

        # Cache existing products for fast lookup
        product_cache = {
            p.sku.upper(): p for p in Product.objects.filter(business=import_obj.business)
        }
        product_name_cache = {
            p.name.lower(): p for p in Product.objects.filter(business=import_obj.business)
        }

        default_cat, _ = ProductCategory.objects.get_or_create(
            business=import_obj.business,
            name="General Grocery",
            defaults={'description': 'Auto-created category from sales import'}
        )

        transactions_created = 0
        items_created = 0

        # Group rows by invoice or unique timestamp if invoice missing
        for idx, row in df.iterrows():
            try:
                txn_date = pd.to_datetime(row[date_col])
                if pd.isna(txn_date.tzinfo) or txn_date.tzinfo is None:
                    txn_date = timezone.make_aware(txn_date)
            except Exception:
                txn_date = timezone.now()

            inv_num = str(row[inv_col]).strip() if inv_col and not pd.isna(row.get(inv_col)) else f"IMP-{import_obj.id.hex[:6]}-{idx+1}"
            
            raw_sku = str(row[sku_col]).strip().upper() if sku_col and not pd.isna(row.get(sku_col)) else f"SKU-{idx+1}"
            raw_name = str(row[name_col]).strip() if name_col and not pd.isna(row.get(name_col)) else raw_sku

            qty = Decimal(str(row[qty_col]))
            price = Decimal(str(row[price_col]))
            disc = Decimal(str(row[disc_col])) if disc_col and not pd.isna(row.get(disc_col)) else Decimal('0.00')

            # Find or create product
            product = product_cache.get(raw_sku) or product_name_cache.get(raw_name.lower())
            if not product:
                cost_estimate = round(price * Decimal('0.80'), 2)
                product = Product.objects.create(
                    business=import_obj.business,
                    category=default_cat,
                    sku=raw_sku,
                    name=raw_name,
                    cost_price=cost_estimate,
                    selling_price=price,
                    current_stock=Decimal('100.00'),
                    min_threshold=Decimal('20.00'),
                    max_target=Decimal('200.00'),
                    lead_time_days=3
                )
                product_cache[raw_sku] = product
                product_name_cache[raw_name.lower()] = product

            # Find or create transaction
            txn, created = SalesTransaction.objects.get_or_create(
                business=import_obj.business,
                invoice_number=inv_num,
                defaults={
                    'branch': import_obj.branch,
                    'transaction_date': txn_date,
                    'payment_method': PaymentMethod.UPI,
                    'net_amount': Decimal('0.00'),
                    'notes': f"Imported from {import_obj.filename}"
                }
            )
            if created:
                transactions_created += 1

            line_subtotal = (qty * price) - disc
            SalesTransactionItem.objects.create(
                transaction=txn,
                product=product,
                quantity=qty,
                unit_price=price,
                unit_cost=product.cost_price,
                discount=disc,
                subtotal=line_subtotal
            )
            items_created += 1

            # Recalculate transaction totals
            txn.net_amount += line_subtotal
            txn.save()

        import_obj.status = ImportStatus.COMPLETED
        import_obj.completed_at = timezone.now()
        import_obj.save()
        return import_obj
