from decimal import Decimal
from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Avg, F
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth, ExtractWeekDay
from rest_framework import views, permissions, status
from rest_framework.response import Response
from apps.sales.models import SalesTransaction, SalesTransactionItem
from apps.catalog.models import Product, ProductCategory

class SalesOverviewAnalyticsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        business = getattr(request, 'business', None)
        days = int(request.query_params.get('days', 30))
        cutoff = timezone.now() - timedelta(days=days)

        tx_qs = SalesTransaction.objects.filter(status='COMPLETED', transaction_date__gte=cutoff)
        item_qs = SalesTransactionItem.objects.filter(transaction__status='COMPLETED', transaction__transaction_date__gte=cutoff)

        if business:
            tx_qs = tx_qs.filter(business=business)
            item_qs = item_qs.filter(transaction__business=business)

        total_revenue = tx_qs.aggregate(rev=Sum('net_amount'))['rev'] or Decimal('0.00')
        total_tx_count = tx_qs.count()
        total_units = item_qs.aggregate(u=Sum('quantity'))['u'] or Decimal('0.00')
        total_cogs = sum((item.quantity * item.unit_cost for item in item_qs.select_related('product')), Decimal('0.00'))

        gross_profit = total_revenue - total_cogs
        margin_percent = round((gross_profit / total_revenue * 100), 2) if total_revenue > 0 else Decimal('0.00')
        avg_basket_value = round((total_revenue / total_tx_count), 2) if total_tx_count > 0 else Decimal('0.00')

        # Daily Revenue Time Series
        daily_trends = (
            tx_qs.annotate(date=TruncDate('transaction_date'))
            .values('date')
            .annotate(revenue=Sum('net_amount'), orders=Count('id'))
            .order_by('date')
        )

        daily_data = [
            {
                'date': str(d['date']),
                'revenue': float(d['revenue'] or 0),
                'orders': d['orders']
            }
            for d in daily_trends
        ]

        # Top 10 Best Sellers
        top_products = (
            item_qs.values('product__name', 'product__sku')
            .annotate(units_sold=Sum('quantity'), revenue=Sum('subtotal'))
            .order_by('-units_sold')[:10]
        )

        # Category Breakdown
        category_breakdown = (
            item_qs.values('product__category__name')
            .annotate(revenue=Sum('subtotal'), units=Sum('quantity'))
            .order_by('-revenue')
        )

        # Day of Week Pattern (1=Sunday, 2=Monday, ..., 7=Saturday in Django)
        dow_names = {1: 'Sun', 2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat'}
        dow_patterns = (
            tx_qs.annotate(dow=ExtractWeekDay('transaction_date'))
            .values('dow')
            .annotate(revenue=Sum('net_amount'), orders=Count('id'))
            .order_by('dow')
        )
        dow_data = [
            {
                'day': dow_names.get(p['dow'], f"Day {p['dow']}"),
                'revenue': float(p['revenue'] or 0),
                'orders': p['orders']
            }
            for p in dow_patterns
        ]

        return Response({
            'period_days': days,
            'summary': {
                'total_revenue': float(total_revenue),
                'total_orders': total_tx_count,
                'total_units_sold': float(total_units),
                'gross_profit': float(gross_profit),
                'gross_margin_percent': float(margin_percent),
                'average_basket_value': float(avg_basket_value),
            },
            'daily_trends': daily_data,
            'top_products': [
                {
                    'name': p['product__name'],
                    'sku': p['product__sku'],
                    'units_sold': float(p['units_sold']),
                    'revenue': float(p['revenue'])
                }
                for p in top_products
            ],
            'category_breakdown': [
                {
                    'category': c['product__category__name'] or 'Uncategorized',
                    'revenue': float(c['revenue'] or 0),
                    'units': float(c['units'] or 0)
                }
                for c in category_breakdown
            ],
            'day_of_week': dow_data
        })
