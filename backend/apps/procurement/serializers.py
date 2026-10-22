from rest_framework import serializers
from .models import PurchaseOrder, PurchaseOrderItem, GoodsReceipt

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_unit = serializers.CharField(source='product.get_unit_display', read_only=True)

    class Meta:
        model = PurchaseOrderItem
        fields = [
            'id', 'purchase_order', 'product', 'product_name', 'product_sku', 'product_unit',
            'quantity_ordered', 'quantity_received', 'unit_cost', 'tax_rate', 'line_total'
        ]
        read_only_fields = ['id', 'quantity_received']


class PurchaseOrderSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    items = PurchaseOrderItemSerializer(many=True, required=False)
    item_count = serializers.IntegerField(source='items.count', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'business', 'branch', 'branch_name', 'supplier', 'supplier_name',
            'po_number', 'order_date', 'expected_delivery_date', 'status', 'status_display',
            'subtotal', 'tax_amount', 'total_amount', 'notes', 'item_count', 'items', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'item_count']


class GoodsReceiptSerializer(serializers.ModelSerializer):
    po_number = serializers.CharField(source='purchase_order.po_number', read_only=True)

    class Meta:
        model = GoodsReceipt
        fields = ['id', 'purchase_order', 'po_number', 'delivery_challan', 'received_date', 'notes']
        read_only_fields = ['id', 'received_date']
