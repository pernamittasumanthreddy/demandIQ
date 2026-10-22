from rest_framework import serializers
from .models import ReorderRecommendation, DeadStockAnalysis

class ReorderRecommendationSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_unit = serializers.CharField(source='product.get_unit_display', read_only=True)
    supplier_name = serializers.CharField(source='preferred_supplier.name', read_only=True)
    cost_price = serializers.DecimalField(source='product.cost_price', max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = ReorderRecommendation
        fields = [
            'id', 'business', 'branch', 'product', 'product_name', 'product_sku',
            'product_unit', 'cost_price', 'preferred_supplier', 'supplier_name',
            'current_stock', 'inventory_position', 'avg_daily_demand', 'lead_time_days',
            'safety_stock', 'reorder_point', 'suggested_quantity', 'estimated_cost',
            'estimated_stockout_days', 'urgency', 'status', 'reason_notes', 'created_at'
        ]


class DeadStockAnalysisSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    category_name = serializers.CharField(source='product.category.name', read_only=True)
    cost_price = serializers.DecimalField(source='product.cost_price', max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = DeadStockAnalysis
        fields = [
            'id', 'business', 'branch', 'product', 'product_name', 'product_sku',
            'category_name', 'cost_price', 'classification', 'days_without_sale',
            'units_in_stock', 'capital_at_risk', 'turnover_ratio', 'recommended_action', 'created_at'
        ]
