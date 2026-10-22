from rest_framework import serializers
from .models import ForecastRun, ForecastResult

class ForecastResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ForecastResult
        fields = ['id', 'forecast_date', 'predicted_demand', 'lower_bound', 'upper_bound']

class ForecastRunSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    results = ForecastResultSerializer(many=True, read_only=True)

    class Meta:
        model = ForecastRun
        fields = [
            'id', 'business', 'branch', 'product', 'product_name', 'product_sku',
            'horizon_days', 'status', 'selected_model', 'metrics', 'candidate_evaluations',
            'explainability', 'results', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'status', 'selected_model', 'metrics', 'candidate_evaluations', 'explainability']
