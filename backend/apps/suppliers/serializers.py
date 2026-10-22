from rest_framework import serializers
from .models import Supplier, SupplierProduct

class SupplierProductSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = SupplierProduct
        fields = [
            'id', 'supplier', 'supplier_name', 'product', 'product_name', 'product_sku',
            'supplier_sku', 'contracted_unit_cost', 'moq', 'lead_time_days', 'is_preferred', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class SupplierSerializer(serializers.ModelSerializer):
    supplied_products = SupplierProductSerializer(many=True, read_only=True)
    product_count = serializers.IntegerField(source='supplied_products.count', read_only=True)

    class Meta:
        model = Supplier
        fields = [
            'id', 'business', 'name', 'contact_person', 'phone', 'email', 'address',
            'gstin', 'typical_lead_time_days', 'min_order_amount', 'payment_terms',
            'rating', 'notes', 'is_active', 'product_count', 'supplied_products', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'product_count']
