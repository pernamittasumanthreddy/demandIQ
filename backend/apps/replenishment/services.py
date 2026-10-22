import math
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Max
from .models import ReorderRecommendation, RecommendationUrgency, RecommendationStatus, DeadStockAnalysis, DeadStockClassification
from apps.catalog.models import Product
from apps.inventory.models import InventoryBalance
from apps.sales.models import SalesTransactionItem
from apps.suppliers.models import SupplierProduct

class ReplenishmentEngine:
    @classmethod
    def generate_recommendations_for_business(cls, business, branch=None):
        """
        Calculates reorder parameters for every active product in the business.
        """
        products = Product.objects.filter(business=business, is_active=True).select_related('category')
        now = timezone.now()
        lookback_start = now - timedelta(days=60)

        recommendations = []
        # Clear existing unaccepted recommendations for a fresh run
        ReorderRecommendation.objects.filter(business=business, status=RecommendationStatus.PENDING).delete()

        for product in products:
            # 1. Historical Sales in lookback window
            sales_items = SalesTransactionItem.objects.filter(
                product=product,
                transaction__status='COMPLETED',
                transaction__transaction_date__gte=lookback_start
            )
            total_sold = sales_items.aggregate(s=Sum('quantity'))['s'] or Decimal('0.00')
            avg_daily_demand = max(Decimal('0.10'), round(total_sold / Decimal('60'), 2))

            # 2. Demand variance approximation for safety stock
            lead_time = product.lead_time_days or 3
            # Safety stock = 1.65 * std_dev * sqrt(L). Robust fallback: 2.0 * avg_daily_demand * sqrt(lead_time)
            safety_stock = round(avg_daily_demand * Decimal(str(math.sqrt(lead_time))) * Decimal('1.2'), 1)
            lead_time_demand = avg_daily_demand * Decimal(str(lead_time))
            reorder_point = round(lead_time_demand + safety_stock, 1)

            # 3. Inventory Position
            current_stock = product.current_stock
            inventory_position = current_stock  # Can incorporate POs if any

            # 4. Target stock (Order-Up-To Level for 14-day cycle)
            review_period = 7
            target_stock = round(((Decimal(str(lead_time)) + Decimal(str(review_period))) * avg_daily_demand) + safety_stock, 1)

            # Check if replenishment is needed
            if inventory_position <= reorder_point:
                raw_need = max(Decimal('0.00'), target_stock - inventory_position)
                
                # Apply MOQ and order multiple constraints
                moq = product.moq or Decimal('1.00')
                mult = product.order_multiple or Decimal('1.00')

                qty = max(moq, raw_need)
                # Round up to multiple
                if mult > 1:
                    qty = Decimal(math.ceil(float(qty) / float(mult))) * mult

                estimated_cost = round(qty * product.cost_price, 2)
                stockout_days = max(0, int(inventory_position / avg_daily_demand)) if avg_daily_demand > 0 else 99

                urgency = RecommendationUrgency.CRITICAL if inventory_position <= (lead_time_demand * Decimal('0.5')) else RecommendationUrgency.WARNING
                
                # Preferred supplier
                pref_contract = SupplierProduct.objects.filter(product=product, is_preferred=True).select_related('supplier').first()
                supplier = pref_contract.supplier if pref_contract else None

                rec = ReorderRecommendation(
                    business=business,
                    branch=branch,
                    product=product,
                    preferred_supplier=supplier,
                    current_stock=current_stock,
                    inventory_position=inventory_position,
                    avg_daily_demand=avg_daily_demand,
                    lead_time_days=lead_time,
                    safety_stock=safety_stock,
                    reorder_point=reorder_point,
                    suggested_quantity=qty,
                    estimated_cost=estimated_cost,
                    estimated_stockout_days=stockout_days,
                    urgency=urgency,
                    reason_notes=f"Stock ({current_stock}) has dropped below Reorder Point ({reorder_point}). Estimated runout in {stockout_days} days."
                )
                recommendations.append(rec)

        if recommendations:
            ReorderRecommendation.objects.bulk_create(recommendations)
        return recommendations


class DeadStockAnalyzer:
    @classmethod
    def evaluate_dead_stock(cls, business, branch=None):
        """
        Analyzes movement velocity, days without sales, and capital at risk.
        """
        products = Product.objects.filter(business=business, is_active=True)
        now = timezone.now()
        DeadStockAnalysis.objects.filter(business=business).delete()

        records = []
        for product in products:
            last_sale = (
                SalesTransactionItem.objects.filter(product=product, transaction__status='COMPLETED')
                .aggregate(latest=Max('transaction__transaction_date'))['latest']
            )

            if last_sale:
                days_idle = (now - last_sale).days
            else:
                days_idle = 90  # Never sold

            # 90-day volume
            cutoff_90 = now - timedelta(days=90)
            units_sold_90 = (
                SalesTransactionItem.objects.filter(
                    product=product,
                    transaction__status='COMPLETED',
                    transaction__transaction_date__gte=cutoff_90
                ).aggregate(s=Sum('quantity'))['s'] or Decimal('0.00')
            )

            stock = product.current_stock
            capital_risk = round(stock * product.cost_price, 2)
            turnover = round(units_sold_90 / max(Decimal('1.00'), stock), 2)

            if stock > 0:
                if days_idle >= 60 or (days_idle >= 45 and units_sold_90 == 0):
                    classification = DeadStockClassification.DEAD_STOCK
                    action = f"No sales for {days_idle} days. Liquidate via clearance discount or bundle with fast-moving staples to recover ₹{capital_risk} capital."
                elif turnover < Decimal('0.4'):
                    classification = DeadStockClassification.SLOW_MOVING
                    action = f"Turnover velocity ({turnover}x) is lagging. Review shelf placement and pause reordering."
                elif stock > (product.max_target * Decimal('1.5')):
                    classification = DeadStockClassification.POTENTIAL_EXCESS
                    action = f"Inventory ({stock} units) exceeds target ceiling ({product.max_target}). Freeze purchase orders."
                else:
                    classification = DeadStockClassification.HEALTHY
                    action = "Stock velocity is healthy and moving in line with forecast."

                records.append(
                    DeadStockAnalysis(
                        business=business,
                        branch=branch,
                        product=product,
                        classification=classification,
                        days_without_sale=days_idle,
                        units_in_stock=stock,
                        capital_at_risk=capital_risk,
                        turnover_ratio=turnover,
                        recommended_action=action
                    )
                )

        if records:
            DeadStockAnalysis.objects.bulk_create(records)
        return records
