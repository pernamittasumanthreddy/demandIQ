from rest_framework import serializers
from .models import InventoryBalance, InventoryMovement, InventoryBatch

class InventoryBalanceSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    product_unit = serializers.CharField(source='product.get_unit_display', read_only=True)
    cost_price = serializers.DecimalField(source='product.cost_price', max_digits=12, decimal_places=2, read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    available_quantity = serializers.ReadOnlyField()
    inventory_position = serializers.ReadOnlyField()

    class Meta:
        model = InventoryBalance
        fields = [
            'id', 'business', 'branch', 'branch_name', 'product', 'product_name',
            'product_sku', 'product_unit', 'cost_price', 'quantity', 'reserved_quantity',
            'incoming_quantity', 'available_quantity', 'inventory_position', 'last_counted_at', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at', 'available_quantity', 'inventory_position']


class InventoryMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)

    class Meta:
        model = InventoryMovement
        fields = [
            'id', 'business', 'branch', 'branch_name', 'product', 'product_name',
            'product_sku', 'movement_type', 'movement_type_display', 'quantity',
            'balance_after', 'unit_cost', 'reference_number', 'reason_notes',
            'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'balance_after', 'created_at']


class InventoryAdjustmentSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    branch_id = serializers.UUIDField()
    delta_quantity = serializers.DecimalField(max_digits=12, decimal_places=2)
    movement_type = serializers.CharField(default='MANUAL_ADJUSTMENT')
    reference_number = serializers.CharField(required=False, default="")
    reason_notes = serializers.CharField(required=False, default="")


class InventoryBatchSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)

    class Meta:
        model = InventoryBatch
        fields = ['id', 'business', 'branch', 'branch_name', 'product', 'product_name', 'batch_number', 'manufacturing_date', 'expiry_date', 'quantity', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
