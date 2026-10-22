from decimal import Decimal
from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum
from .models import ForecastRun, ForecastResult, ForecastStatus
from .serializers import ForecastRunSerializer
from apps.catalog.models import Product
from apps.sales.models import SalesTransactionItem
from apps.businesses.models import Business, Branch
from ml.engine import TimeSeriesEngine

class ForecastRunViewSet(viewsets.ModelViewSet):
    serializer_class = ForecastRunSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        qs = ForecastRun.objects.prefetch_related('results').select_related('product')
        if business:
            return qs.filter(business=business)
        return qs.all()

    @action(detail=False, methods=['post'], url_path='generate')
    def generate_forecast(self, request):
        """
        Executes an on-demand forecast for a specific product and horizon.
        """
        product_id = request.data.get('product_id')
        horizon = int(request.data.get('horizon_days', 14))

        if not product_id:
            return Response({'error': 'product_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Pull historical sales items
        sales_items = (
            SalesTransactionItem.objects.filter(
                product=product,
                transaction__status='COMPLETED'
            )
            .select_related('transaction')
            .order_by('transaction__transaction_date')
        )

        dates = [item.transaction.transaction_date.strftime('%Y-%m-%d') for item in sales_items]
        demands = [float(item.quantity) for item in sales_items]

        # Execute Machine Learning pipeline
        pipeline_output = TimeSeriesEngine.run_forecast_pipeline(
            dates=dates,
            demands=demands,
            horizon_days=horizon
        )

        # Persist Forecast Run
        forecast_run = ForecastRun.objects.create(
            business=product.business,
            product=product,
            horizon_days=horizon,
            status=ForecastStatus.COMPLETED if pipeline_output.get('status') == 'SUCCESS' else ForecastStatus.COMPLETED,
            selected_model=pipeline_output.get('selected_model', 'Baseline Fallback'),
            metrics=pipeline_output.get('metrics', {}),
            candidate_evaluations=pipeline_output.get('all_candidate_evaluations', []),
            explainability=pipeline_output.get('explainability', {})
        )

        # Save individual daily forecast lines
        results_to_create = []
        for item in pipeline_output.get('forecasts', []):
            results_to_create.append(
                ForecastResult(
                    forecast_run=forecast_run,
                    forecast_date=item['date'],
                    predicted_demand=Decimal(str(item['predicted_demand'])),
                    lower_bound=Decimal(str(item['lower_bound'])),
                    upper_bound=Decimal(str(item['upper_bound']))
                )
            )
        if results_to_create:
            ForecastResult.objects.bulk_create(results_to_create)

        return Response({
            'forecast_run_id': str(forecast_run.id),
            'pipeline_result': pipeline_output
        }, status=status.HTTP_201_CREATED)
