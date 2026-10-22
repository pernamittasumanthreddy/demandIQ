from rest_framework import serializers
from .models import SalesTransaction, SalesTransactionItem

class SalesTransactionItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    gross_profit = serializers.ReadOnlyField()

    class Meta:
        model = SalesTransactionItem
        fields = [
            'id', 'transaction', 'product', 'product_name', 'product_sku', 'quantity',
            'unit_price', 'unit_cost', 'discount', 'tax_amount', 'subtotal',
            'gross_profit', 'is_returned'
        ]
        read_only_fields = ['id', 'gross_profit']


class SalesTransactionSerializer(serializers.ModelSerializer):
    items = SalesTransactionItemSerializer(many=True, required=False)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    item_count = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = SalesTransaction
        fields = [
            'id', 'business', 'branch', 'branch_name', 'invoice_number', 'transaction_date',
            'payment_method', 'customer_type', 'subtotal', 'total_tax', 'total_discount',
            'net_amount', 'status', 'notes', 'item_count', 'items', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'item_count']
