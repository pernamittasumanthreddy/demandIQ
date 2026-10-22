import random
from datetime import datetime, timedelta
from decimal import Decimal
import numpy as np
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.businesses.models import Business, Branch, BusinessMembership, MemberRole, IndustryType
from apps.catalog.models import ProductCategory, Product, UnitOfMeasure
from apps.inventory.models import InventoryBalance, InventoryMovement, MovementType
from apps.suppliers.models import Supplier, SupplierProduct
from apps.sales.models import SalesTransaction, SalesTransactionItem, PaymentMethod, CustomerType
from apps.replenishment.services import ReplenishmentEngine, DeadStockAnalyzer
from apps.notifications.models import Notification, NotificationSeverity

User = get_user_model()

class Command(BaseCommand):
    help = "Seeds DemandIQ with realistic Indian Retail demonstration dataset (Sri Lakshmi Supermarket & Kirana)"

    def handle(self, *args, **options):
        random.seed(42)
        np.random.seed(42)
        self.stdout.write(self.style.NOTICE("Initializing DemandIQ Indian Retail Demonstration Dataset..."))

        # 1. Users
        owner_user, created = User.objects.get_or_create(
            email="owner@lakshmi.in",
            defaults={
                'username': 'ramesh_patel',
                'first_name': 'Ramesh',
                'last_name': 'Patel',
                'phone': '+91 98450 12345',
                'designation': 'Managing Partner',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            owner_user.set_password("DemandIQ@2026")
            owner_user.save()

        # 2. Business
        business, _ = Business.objects.get_or_create(
            name="Sri Lakshmi Supermarket & Kirana",
            defaults={
                'industry_type': IndustryType.GROCERY,
                'gstin': '29AABCS1429B1Z8',
                'pan': 'AABCS1429B',
                'phone': '+91 80 2525 8899',
                'email': 'store@lakshmi.in',
                'currency': 'INR',
                'currency_symbol': '₹',
                'timezone': 'Asia/Kolkata',
                'fiscal_year_start': 4
            }
        )

        # 3. Branches
        main_branch, _ = Branch.objects.get_or_create(
            business=business,
            code="INDIRA01",
            defaults={
                'name': 'Indiranagar Flagship Store',
                'is_main': True,
                'address_line': '#142, 100ft Road, Indiranagar',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'pincode': '560038',
                'phone': '+91 80 2525 8891'
            }
        )

        kora_branch, _ = Branch.objects.get_or_create(
            business=business,
            code="KORA02",
            defaults={
                'name': 'Koramangala 4th Block Outlet',
                'is_main': False,
                'address_line': '#58, 80ft Road, 4th Block Koramangala',
                'city': 'Bengaluru',
                'state': 'Karnataka',
                'pincode': '560034',
                'phone': '+91 80 2553 4412'
            }
        )

        # 4. Membership
        BusinessMembership.objects.get_or_create(
            user=owner_user,
            business=business,
            defaults={'role': MemberRole.OWNER, 'branch': main_branch}
        )

        # 5. Suppliers
        suppliers_data = [
            {
                'name': 'Kaveri Agro Commodities & Grains',
                'contact_person': 'Suresh Gowda',
                'phone': '+91 94480 33411',
                'email': 'orders@kaveriagro.in',
                'address': 'APMC Yard, Yeshwanthpur, Bengaluru',
                'gstin': '29AAACK2214C1Z3',
                'lead_time': 3,
                'min_order': Decimal('10000.00'),
                'terms': 'Net 15 Days',
                'rating': Decimal('4.8')
            },
            {
                'name': 'Hindustan Consumer Depot (FMCG)',
                'contact_person': 'Anand Verma',
                'phone': '+91 98800 55214',
                'email': 'bangalore.depot@huldist.in',
                'address': 'Peenya Industrial Area, 2nd Stage, Bengaluru',
                'gstin': '29AABCH9912D1Z5',
                'lead_time': 2,
                'min_order': Decimal('15000.00'),
                'terms': 'Net 21 Days',
                'rating': Decimal('4.6')
            },
            {
                'name': 'Apex MedPlus & OTC Wholesalers',
                'contact_person': 'Dr. K. Srinivas',
                'phone': '+91 98451 99002',
                'email': 'supply@apexmed.in',
                'address': 'Kalasipalyam Medical Market, Bengaluru',
                'gstin': '29AAACA4481M1Z1',
                'lead_time': 1,
                'min_order': Decimal('5000.00'),
                'terms': 'Immediate COD / 7 Days',
                'rating': Decimal('4.9')
            },
            {
                'name': 'Navneet Stationery & Paper Syndicate',
                'contact_person': 'Manoj Jain',
                'phone': '+91 98200 44118',
                'email': 'stationery.orders@navneetblr.in',
                'address': 'Avenue Road, City Market, Bengaluru',
                'gstin': '29AABCN3310P1Z9',
                'lead_time': 4,
                'min_order': Decimal('4000.00'),
                'terms': 'Net 30 Days',
                'rating': Decimal('4.4')
            }
        ]

        supplier_objs = {}
        for s_data in suppliers_data:
            s_obj, _ = Supplier.objects.get_or_create(
                business=business,
                name=s_data['name'],
                defaults={
                    'contact_person': s_data['contact_person'],
                    'phone': s_data['phone'],
                    'email': s_data['email'],
                    'address': s_data['address'],
                    'gstin': s_data['gstin'],
                    'typical_lead_time_days': s_data['lead_time'],
                    'min_order_amount': s_data['min_order'],
                    'payment_terms': s_data['terms'],
                    'rating': s_data['rating']
                }
            )
            supplier_objs[s_data['name']] = s_obj

        # 6. Categories & Products
        categories_data = {
            'Staples & Grains': [
                {'sku': 'RICE-SONA-25K', 'name': 'Sona Masoori Rice 25kg (Royal)', 'brand': 'Royal Harvest', 'unit': UnitOfMeasure.PACK, 'cost': Decimal('1250.00'), 'price': Decimal('1499.00'), 'stock': Decimal('12.00'), 'min': Decimal('25.00'), 'max': Decimal('80.00'), 'lead': 3, 'moq': Decimal('10.00'), 'mult': Decimal('5.00'), 'supplier': 'Kaveri Agro Commodities & Grains'},
                {'sku': 'ATTA-ASHIR-10K', 'name': 'Aashirvaad Shudh Chakki Atta 10kg', 'brand': 'ITC Aashirvaad', 'unit': UnitOfMeasure.PACK, 'cost': Decimal('410.00'), 'price': Decimal('475.00'), 'stock': Decimal('8.00'), 'min': Decimal('30.00'), 'max': Decimal('120.00'), 'lead': 2, 'moq': Decimal('15.00'), 'mult': Decimal('5.00'), 'supplier': 'Hindustan Consumer Depot (FMCG)'},
                {'sku': 'DAL-TOOR-1KG', 'name': 'Premium Unpolished Toor Dal 1kg', 'brand': 'Tata Sampann', 'unit': UnitOfMeasure.PACK, 'cost': Decimal('142.00'), 'price': Decimal('175.00'), 'stock': Decimal('45.00'), 'min': Decimal('35.00'), 'max': Decimal('150.00'), 'lead': 3, 'moq': Decimal('20.00'), 'mult': Decimal('10.00'), 'supplier': 'Kaveri Agro Commodities & Grains'},
                {'sku': 'OIL-FORT-1L', 'name': 'Fortune Sunlite Refined Sunflower Oil 1L', 'brand': 'Fortune', 'unit': UnitOfMeasure.PACK, 'cost': Decimal('118.00'), 'price': Decimal('138.00'), 'stock': Decimal('32.00'), 'min': Decimal('40.00'), 'max': Decimal('180.00'), 'lead': 2, 'moq': Decimal('24.00'), 'mult': Decimal('12.00'), 'supplier': 'Hindustan Consumer Depot (FMCG)'},
                {'sku': 'SALT-TATA-1K', 'name': 'Tata Salt Vacuum Evaporated 1kg', 'brand': 'Tata', 'unit': UnitOfMeasure.PACK, 'cost': Decimal('23.00'), 'price': Decimal('28.00'), 'stock': Decimal('85.00'), 'min': Decimal('50.00'), 'max': Decimal('250.00'), 'lead': 2, 'moq': Decimal('50.00'), 'mult': Decimal('25.00'), 'supplier': 'Hindustan Consumer Depot (FMCG)'},
            ],
            'Dairy & Bakery': [
                {'sku': 'BUTTER-AMUL-500G', 'name': 'Amul Pasteurized Butter 500g', 'brand': 'Amul', 'unit': UnitOfMeasure.PACK, 'cost': Decimal('235.00'), 'price': Decimal('275.00'), 'stock': Decimal('14.00'), 'min': Decimal('20.00'), 'max': Decimal('60.00'), 'lead': 1, 'moq': Decimal('12.00'), 'mult': Decimal('6.00'), 'is_perishable': True, 'shelf': 180, 'supplier': 'Hindustan Consumer Depot (FMCG)'},
                {'sku': 'BREAD-BRIT-WHITE', 'name': 'Britannia Daily Fresh White Bread 400g', 'brand': 'Britannia', 'unit': UnitOfMeasure.PACK, 'cost': Decimal('36.00'), 'price': Decimal('45.00'), 'stock': Decimal('5.00'), 'min': Decimal('15.00'), 'max': Decimal('40.00'), 'lead': 1, 'moq': Decimal('10.00'), 'mult': Decimal('5.00'), 'is_perishable': True, 'shelf': 5, 'supplier': 'Hindustan Consumer Depot (FMCG)'},
                {'sku': 'PANEER-MILK-200G', 'name': 'Nandini Fresh Malai Paneer 200g', 'brand': 'Nandini (KMF)', 'unit': UnitOfMeasure.PACK, 'cost': Decimal('78.00'), 'price': Decimal('92.00'), 'stock': Decimal('18.00'), 'min': Decimal('15.00'), 'max': Decimal('50.00'), 'lead': 1, 'moq': Decimal('10.00'), 'mult': Decimal('5.00'), 'is_perishable': True, 'shelf': 30, 'supplier': 'Hindustan Consumer Depot (FMCG)'},
            ],
            'Snacks & Beverages': [
                {'sku': 'TEA-TATA-GOLD-500G', 'name': 'Tata Tea Gold Leaf 500g', 'brand': 'Tata Tea', 'unit': UnitOfMeasure.PACK, 'cost': Decimal('290.00'), 'price': Decimal('345.00'), 'stock': Decimal('22.00'), 'min': Decimal('20.00'), 'max': Decimal('80.00'), 'lead': 2, 'moq': Decimal('12.00'), 'mult': Decimal('6.00'), 'supplier': 'Hindustan Consumer Depot (FMCG)'},
                {'sku': 'COFFEE-NES-100G', 'name': 'Nescafe Classic Instant Coffee Jar 100g', 'brand': 'Nestle', 'unit': UnitOfMeasure.PACK, 'cost': Decimal('285.00'), 'price': Decimal('340.00'), 'stock': Decimal('16.00'), 'min': Decimal('15.00'), 'max': Decimal('60.00'), 'lead': 2, 'moq': Decimal('10.00'), 'mult': Decimal('5.00'), 'supplier': 'Hindustan Consumer Depot (FMCG)'},
                {'sku': 'SNACK-HALD-BHUJIA', 'name': 'Haldiram Nagpur Aloo Bhujia 400g', 'brand': 'Haldiram', 'unit': UnitOfMeasure.PACK, 'cost': Decimal('98.00'), 'price': Decimal('120.00'), 'stock': Decimal('38.00'), 'min': Decimal('25.00'), 'max': Decimal('100.00'), 'lead': 3, 'moq': Decimal('20.00'), 'mult': Decimal('10.00'), 'supplier': 'Hindustan Consumer Depot (FMCG)'},
                {'sku': 'BISCUIT-PARLE-G', 'name': 'Parle-G Gold Glucose Biscuits 1kg', 'brand': 'Parle', 'unit': UnitOfMeasure.PACK, 'cost': Decimal('92.00'), 'price': Decimal('110.00'), 'stock': Decimal('42.00'), 'min': Decimal('30.00'), 'max': Decimal('120.00'), 'lead': 2, 'moq': Decimal('24.00'), 'mult': Decimal('12.00'), 'supplier': 'Hindustan Consumer Depot (FMCG)'},
            ],
            'Pharmacy & OTC Wellness': [
                {'sku': 'MED-DOLO-650', 'name': 'Dolo 650mg Paracetamol Tablets (15 Tabs)', 'brand': 'Micro Labs', 'unit': UnitOfMeasure.STRIP, 'cost': Decimal('24.50'), 'price': Decimal('33.00'), 'stock': Decimal('4.00'), 'min': Decimal('30.00'), 'max': Decimal('150.00'), 'lead': 1, 'moq': Decimal('25.00'), 'mult': Decimal('10.00'), 'supplier': 'Apex MedPlus & OTC Wholesalers'},
                {'sku': 'MED-DIGENE-GEL', 'name': 'Digene Antacid Gel Mint 200ml Bottle', 'brand': 'Abbott', 'unit': UnitOfMeasure.PIECE, 'cost': Decimal('135.00'), 'price': Decimal('168.00'), 'stock': Decimal('21.00'), 'min': Decimal('15.00'), 'max': Decimal('60.00'), 'lead': 1, 'moq': Decimal('10.00'), 'mult': Decimal('5.00'), 'supplier': 'Apex MedPlus & OTC Wholesalers'},
                {'sku': 'MED-VICKS-50G', 'name': 'Vicks VapoRub Balm Jar 50g', 'brand': 'P&G', 'unit': UnitOfMeasure.PACK, 'cost': Decimal('125.00'), 'price': Decimal('155.00'), 'stock': Decimal('19.00'), 'min': Decimal('20.00'), 'max': Decimal('80.00'), 'lead': 2, 'moq': Decimal('15.00'), 'mult': Decimal('5.00'), 'supplier': 'Apex MedPlus & OTC Wholesalers'},
                # Dead stock example: An obscure branded herbal tea that didn't sell
                {'sku': 'MED-HERBAL-DIAB', 'name': 'AyurVedica Bitter Gourd Extract Tea 250g', 'brand': 'AyurVedica', 'unit': UnitOfMeasure.PACK, 'cost': Decimal('380.00'), 'price': Decimal('550.00'), 'stock': Decimal('35.00'), 'min': Decimal('5.00'), 'max': Decimal('20.00'), 'lead': 5, 'moq': Decimal('10.00'), 'mult': Decimal('5.00'), 'supplier': 'Apex MedPlus & OTC Wholesalers'},
            ],
            'Stationery & General': [
                {'sku': 'NOTE-CLS-A4', 'name': 'Classmate Pulse A4 Spiral Notebook (300 Pgs)', 'brand': 'ITC Classmate', 'unit': UnitOfMeasure.PIECE, 'cost': Decimal('125.00'), 'price': Decimal('160.00'), 'stock': Decimal('28.00'), 'min': Decimal('20.00'), 'max': Decimal('100.00'), 'lead': 4, 'moq': Decimal('20.00'), 'mult': Decimal('10.00'), 'supplier': 'Navneet Stationery & Paper Syndicate'},
                {'sku': 'PEN-REYN-GEL-BOX', 'name': 'Reynolds Aeroslim Gel Pen Blue (Pack of 10)', 'brand': 'Reynolds', 'unit': UnitOfMeasure.BOX, 'cost': Decimal('80.00'), 'price': Decimal('100.00'), 'stock': Decimal('45.00'), 'min': Decimal('15.00'), 'max': Decimal('80.00'), 'lead': 4, 'moq': Decimal('15.00'), 'mult': Decimal('5.00'), 'supplier': 'Navneet Stationery & Paper Syndicate'},
                # Another dead stock example: Specialized engineering graph paper pad
                {'sku': 'STAT-ENG-GRAPH', 'name': 'Camlin Isometric 3D Grid Drafting Pad A3', 'brand': 'Camlin', 'unit': UnitOfMeasure.PACK, 'cost': Decimal('210.00'), 'price': Decimal('320.00'), 'stock': Decimal('40.00'), 'min': Decimal('5.00'), 'max': Decimal('15.00'), 'lead': 4, 'moq': Decimal('10.00'), 'mult': Decimal('5.00'), 'supplier': 'Navneet Stationery & Paper Syndicate'}
            ]
        }

        created_products = []
        for cat_name, prod_list in categories_data.items():
            cat_obj, _ = ProductCategory.objects.get_or_create(
                business=business,
                name=cat_name,
                defaults={'description': f"Retail items in {cat_name}"}
            )

            for p_info in prod_list:
                product, _ = Product.objects.get_or_create(
                    business=business,
                    sku=p_info['sku'],
                    defaults={
                        'category': cat_obj,
                        'name': p_info['name'],
                        'brand': p_info['brand'],
                        'unit': p_info['unit'],
                        'cost_price': p_info['cost'],
                        'selling_price': p_info['price'],
                        'current_stock': p_info['stock'],
                        'min_threshold': p_info['min'],
                        'max_target': p_info['max'],
                        'lead_time_days': p_info['lead'],
                        'moq': p_info['moq'],
                        'order_multiple': p_info['mult'],
                        'is_perishable': p_info.get('is_perishable', False),
                        'shelf_life_days': p_info.get('shelf', 0)
                    }
                )
                created_products.append(product)

                # Initialize branch inventory balance
                InventoryBalance.objects.get_or_create(
                    business=business,
                    branch=main_branch,
                    product=product,
                    defaults={'quantity': p_info['stock']}
                )

                # Link supplier contract
                supp_name = p_info['supplier']
                if supp_name in supplier_objs:
                    SupplierProduct.objects.get_or_create(
                        supplier=supplier_objs[supp_name],
                        product=product,
                        defaults={
                            'contracted_unit_cost': p_info['cost'],
                            'moq': p_info['moq'],
                            'lead_time_days': p_info['lead'],
                            'is_preferred': True
                        }
                    )

        # 7. Generate 180 Days of Historical Sales Transactions
        self.stdout.write("Generating 180 days of realistic daily sales history...")
        now = timezone.now()
        start_date = now - timedelta(days=180)

        # Base daily demand rates for products
        demand_profiles = {
            'RICE-SONA-25K': (3.5, 1.2),
            'ATTA-ASHIR-10K': (5.0, 1.8),
            'DAL-TOOR-1KG': (7.0, 2.0),
            'OIL-FORT-1L': (8.0, 2.5),
            'SALT-TATA-1K': (6.0, 1.5),
            'BUTTER-AMUL-500G': (4.0, 1.5),
            'BREAD-BRIT-WHITE': (6.0, 2.0),
            'PANEER-MILK-200G': (3.0, 1.2),
            'TEA-TATA-GOLD-500G': (4.0, 1.5),
            'COFFEE-NES-100G': (2.5, 1.0),
            'SNACK-HALD-BHUJIA': (5.0, 2.0),
            'BISCUIT-PARLE-G': (7.0, 2.2),
            'MED-DOLO-650': (8.0, 3.0),
            'MED-DIGENE-GEL': (2.5, 1.0),
            'MED-VICKS-50G': (3.0, 1.2),
            'NOTE-CLS-A4': (3.5, 1.5),
            'PEN-REYN-GEL-BOX': (4.0, 1.8),
            # Dead stock items: Zero demand in recent 75 days!
            'MED-HERBAL-DIAB': (0.0, 0.0),
            'STAT-ENG-GRAPH': (0.0, 0.0),
        }

        transactions_to_create = []
        items_to_create = []

        # Generate day by day
        for day_offset in range(180):
            current_day = start_date + timedelta(days=day_offset)
            dow = current_day.weekday() # 5=Sat, 6=Sun
            month = current_day.month

            # Indian Retail Weekend multiplier (+35% on Sat/Sun)
            weekend_boost = 1.35 if dow in [5, 6] else 1.0

            # Festival boost (e.g., Diwali in Oct/Nov +50% for sweets/oil/rice)
            festival_boost = 1.50 if (month == 10 and 15 <= current_day.day <= 25) else 1.0

            # 2 to 6 shopping bills per day in the simulation
            daily_bills = random.randint(3, 7)

            for b_idx in range(daily_bills):
                bill_time = current_day.replace(
                    hour=random.randint(9, 21),
                    minute=random.randint(0, 59),
                    second=random.randint(0, 59)
                )
                inv_code = f"INV-{bill_time.strftime('%y%m%d')}-{b_idx+1:03d}"
                pay_method = random.choice([PaymentMethod.UPI, PaymentMethod.UPI, PaymentMethod.CASH, PaymentMethod.CARD])

                tx = SalesTransaction(
                    business=business,
                    branch=main_branch,
                    invoice_number=inv_code,
                    transaction_date=bill_time,
                    payment_method=pay_method,
                    customer_type=CustomerType.WALK_IN,
                    net_amount=Decimal('0.00'),
                    notes="POS Sale"
                )
                transactions_to_create.append(tx)

                # Pick 2 to 4 items for this basket
                sampled_products = random.sample(created_products, k=random.randint(2, 4))
                bill_total = Decimal('0.00')

                for prod in sampled_products:
                    mean_d, std_d = demand_profiles.get(prod.sku, (2.0, 1.0))
                    if mean_d == 0.0:
                        continue # Dead stock never bought
                    
                    qty_val = max(1, int(round(np.random.normal(mean_d * 0.4 * weekend_boost * festival_boost, std_d * 0.2))))
                    qty = Decimal(str(qty_val))
                    unit_p = prod.selling_price
                    unit_c = prod.cost_price
                    subtotal = qty * unit_p

                    item = SalesTransactionItem(
                        transaction=tx,
                        product=prod,
                        quantity=qty,
                        unit_price=unit_p,
                        unit_cost=unit_c,
                        discount=Decimal('0.00'),
                        subtotal=subtotal
                    )
                    items_to_create.append(item)
                    bill_total += subtotal

                tx.net_amount = bill_total

        # Bulk save sales history
        self.stdout.write("Persisting transaction records in database...")
        SalesTransaction.objects.bulk_create(transactions_to_create, batch_size=200)
        # Refresh ids
        created_txs = {t.invoice_number: t for t in SalesTransaction.objects.filter(business=business)}
        for item in items_to_create:
            item.transaction_id = created_txs[item.transaction.invoice_number].id
        SalesTransactionItem.objects.bulk_create(items_to_create, batch_size=500)

        # 8. Run Replenishment Engine & Dead Stock Analyzer
        self.stdout.write("Running replenishment & dead stock intelligence...")
        recs = ReplenishmentEngine.generate_recommendations_for_business(business, main_branch)
        dead_records = DeadStockAnalyzer.evaluate_dead_stock(business, main_branch)

        # 9. In-app notification
        Notification.objects.create(
            business=business,
            recipient=owner_user,
            title="Weekly Stock Review Ready",
            message=f"Your weekly replenishment review is ready: {len(recs)} items need reordering, and {len(dead_records)} items flagged for velocity review.",
            severity=NotificationSeverity.WARNING,
            link_url="/replenishment"
        )

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded DemandIQ!\n"
            f"- Business: {business.name}\n"
            f"- User Account: owner@lakshmi.in (Password: DemandIQ@2026)\n"
            f"- Products: {len(created_products)} SKUs across 5 retail categories\n"
            f"- Suppliers: 4 active distributor contracts\n"
            f"- Sales Transactions: {len(transactions_to_create)} bills\n"
            f"- Reorder Recommendations: {len(recs)} generated\n"
            f"- Dead Stock Items: {len(dead_records)} evaluated"
        ))
