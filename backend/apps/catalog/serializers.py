from rest_framework import serializers
from .models import ProductCategory, Product

class ProductCategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = ProductCategory
        fields = ['id', 'business', 'name', 'slug', 'description', 'product_count', 'created_at']
        read_only_fields = ['id', 'created_at', 'product_count']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    gross_margin_percent = serializers.ReadOnlyField()
    stock_status = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'business', 'category', 'category_name', 'sku', 'barcode', 'name',
            'description', 'brand', 'unit', 'cost_price', 'selling_price', 'tax_rate',
            'current_stock', 'min_threshold', 'max_target', 'lead_time_days', 'moq',
            'order_multiple', 'is_perishable', 'shelf_life_days', 'is_active',
            'gross_margin_percent', 'stock_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'gross_margin_percent', 'stock_status']
