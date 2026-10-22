from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Avg
from rest_framework import views, permissions, status
from rest_framework.response import Response
from apps.catalog.models import Product, ProductCategory
from apps.replenishment.models import ReorderRecommendation, DeadStockAnalysis
from apps.sales.models import SalesTransaction, SalesTransactionItem
from apps.forecasting.models import ForecastRun

class WeeklyStockReviewView(views.APIView):
    """
    Generates humanized, authentic Weekly Stock Review for the business owner.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        business = getattr(request, 'business', None)
        now = timezone.now()
        week_ago = now - timedelta(days=7)

        # Sales in the past week
        sales_tx = SalesTransaction.objects.filter(status='COMPLETED', transaction_date__gte=week_ago)
        if business:
            sales_tx = sales_tx.filter(business=business)
        
        week_revenue = sales_tx.aggregate(r=Sum('net_amount'))['r'] or Decimal('0.00')
        week_orders = sales_tx.count()

        # Reorder recommendations pending
        recs = ReorderRecommendation.objects.all()
        if business:
            recs = recs.filter(business=business)

        critical_recs = recs.filter(urgency='CRITICAL')
        warning_recs = recs.filter(urgency='WARNING')
        total_reorder_cost = recs.aggregate(c=Sum('estimated_cost'))['c'] or Decimal('0.00')

        # Dead stock items
        dead_stock = DeadStockAnalysis.objects.all()
        if business:
            dead_stock = dead_stock.filter(business=business)
        dead_items = dead_stock.filter(classification='DEAD_STOCK')
        capital_locked = dead_stock.exclude(classification='HEALTHY').aggregate(c=Sum('capital_at_risk'))['c'] or Decimal('0.00')

        # Humanized Action Items
        action_highlights = []
        if critical_recs.exists():
            top_crit = critical_recs.first()
            action_highlights.append({
                'type': 'CRITICAL_REORDER',
                'title': f"Stockout Alert: {top_crit.product.name}",
                'message': f"Available stock ({top_crit.current_stock}) will run out in ~{top_crit.estimated_stockout_days} days. Review order of {top_crit.suggested_quantity} {top_crit.product.get_unit_display()}."
            })

        if dead_items.exists():
            top_dead = dead_items.first()
            action_highlights.append({
                'type': 'DEAD_STOCK',
                'title': f"Capital Tied Up: {top_dead.product.name}",
                'message': f"₹{top_dead.capital_at_risk} tied up with zero sales in {top_dead.days_without_sale} days. Consider bundled discount."
            })

        action_highlights.append({
            'type': 'WEEKLY_MOMENTUM',
            'title': "Weekly Sales Velocity",
            'message': f"Generated ₹{float(week_revenue):,.2f} across {week_orders} customer orders this week."
        })

        return Response({
            'review_period': f"{week_ago.strftime('%b %d')} — {now.strftime('%b %d, %Y')}",
            'executive_summary': {
                'weekly_revenue': float(week_revenue),
                'weekly_orders': week_orders,
                'critical_reorder_count': critical_recs.count(),
                'warning_reorder_count': warning_recs.count(),
                'total_reorder_investment': float(total_reorder_cost),
                'idle_capital_at_risk': float(capital_locked),
                'dead_stock_count': dead_items.count()
            },
            'action_highlights': action_highlights,
            'top_reorders': [
                {
                    'product_name': r.product.name,
                    'sku': r.product.sku,
                    'current_stock': float(r.current_stock),
                    'suggested_quantity': float(r.suggested_quantity),
                    'cost': float(r.estimated_cost),
                    'urgency': r.urgency
                }
                for r in recs[:5]
            ]
        })


class InventoryValuationReportView(views.APIView):
    """
    Inventory valuation by category, unit cost, and retail sales potential.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        business = getattr(request, 'business', None)
        products = Product.objects.filter(is_active=True).select_related('category')
        if business:
            products = products.filter(business=business)

        total_cost_val = Decimal('0.00')
        total_retail_val = Decimal('0.00')
        category_map = {}

        for p in products:
            c_val = p.current_stock * p.cost_price
            r_val = p.current_stock * p.selling_price
            total_cost_val += c_val
            total_retail_val += r_val

            cat_name = p.category.name if p.category else 'General'
            if cat_name not in category_map:
                category_map[cat_name] = {'cost_val': Decimal('0.00'), 'retail_val': Decimal('0.00'), 'items': 0}
            category_map[cat_name]['cost_val'] += c_val
            category_map[cat_name]['retail_val'] += r_val
            category_map[cat_name]['items'] += 1

        unrealized_profit = total_retail_val - total_cost_val

        return Response({
            'total_cost_valuation': float(total_cost_val),
            'total_retail_valuation': float(total_retail_val),
            'potential_gross_profit': float(unrealized_profit),
            'total_skus': products.count(),
            'by_category': [
                {
                    'category': k,
                    'cost_value': float(v['cost_val']),
                    'retail_value': float(v['retail_val']),
                    'sku_count': v['items']
                }
                for k, v in category_map.items()
            ]
        })
