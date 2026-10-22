import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from apps.businesses.models import Business, Branch
from apps.catalog.models import Product

class MovementType(models.TextChoices):
    PURCHASE_RECEIPT = 'PURCHASE_RECEIPT', 'Purchase Order Receipt'
    SALE = 'SALE', 'Customer Sale'
    RETURN_RESTOCK = 'RETURN_RESTOCK', 'Customer Return (Restocked)'
    MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT', 'Manual Physical Audit Adjustment'
    DAMAGED_EXPIRY = 'DAMAGED_EXPIRY', 'Damaged / Expired Write-off'
    INTERNAL_TRANSFER = 'INTERNAL_TRANSFER', 'Inter-Branch Transfer'

class InventoryBalance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='inventory_balances')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='inventory_balances')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='branch_balances')
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="On-Hand Quantity")
    reserved_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Allocated / Reserved")
    incoming_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Expected on POs")
    last_counted_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Inventory Balance"
        verbose_name_plural = "Inventory Balances"
        unique_together = ('branch', 'product')
        ordering = ['product__name']

    @property
    def available_quantity(self):
        """Physical stock available for immediate fulfillment."""
        return max(Decimal('0.00'), self.quantity - self.reserved_quantity)

    @property
    def inventory_position(self):
        """Standard replenishment inventory position: On-hand + On-order - Reserved."""
        return self.quantity + self.incoming_quantity - self.reserved_quantity

    def __str__(self):
        return f"{self.product.name} @ {self.branch.name}: {self.quantity} {self.product.get_unit_display()}"


class InventoryMovement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='inventory_movements')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='inventory_movements')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=30, choices=MovementType.choices)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Delta Quantity (+/-)")
    balance_after = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Balance Post Movement")
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    reference_number = models.CharField(max_length=80, blank=True, default="", verbose_name="PO / Invoice / Audit Ref")
    reason_notes = models.TextField(blank=True, default="")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Inventory Movement"
        verbose_name_plural = "Inventory Movements"
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.created_at:%Y-%m-%d}] {self.get_movement_type_display()} {self.quantity}x {self.product.name}"


class InventoryBatch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='batches')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='batches')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='batches')
    batch_number = models.CharField(max_length=60, verbose_name="Lot / Batch No")
    manufacturing_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True, verbose_name="Expiration Date")
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Inventory Batch"
        verbose_name_plural = "Inventory Batches"
        ordering = ['expiry_date', 'batch_number']

    def __str__(self):
        return f"Batch {self.batch_number} - {self.product.name} (Exp: {self.expiry_date})"
