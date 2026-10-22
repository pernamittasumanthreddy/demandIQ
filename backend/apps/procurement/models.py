import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from apps.businesses.models import Business, Branch
from apps.suppliers.models import Supplier
from apps.catalog.models import Product

class PurchaseOrderStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft PO'
    REVIEWED = 'REVIEWED', 'Under Manager Review'
    APPROVED = 'APPROVED', 'Approved for Ordering'
    ORDERED = 'ORDERED', 'Issued to Supplier'
    PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED', 'Partially Received'
    RECEIVED = 'RECEIVED', 'Fully Received'
    CANCELLED = 'CANCELLED', 'Cancelled'

class PurchaseOrder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='purchase_orders')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='purchase_orders')
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='purchase_orders')
    po_number = models.CharField(max_length=60, verbose_name="PO Reference Code")
    order_date = models.DateField(auto_now_add=True)
    expected_delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=25, choices=PurchaseOrderStatus.choices, default=PurchaseOrderStatus.DRAFT)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Total PO Amount (₹)")
    notes = models.TextField(blank=True, default="")
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_pos')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Purchase Order"
        verbose_name_plural = "Purchase Orders"
        unique_together = ('business', 'po_number')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.po_number} -> {self.supplier.name} (₹{self.total_amount}) [{self.status}]"


class PurchaseOrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='po_items')
    quantity_ordered = models.DecimalField(max_digits=12, decimal_places=2)
    quantity_received = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('5.00'))
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        verbose_name = "PO Item"
        verbose_name_plural = "PO Items"

    def __str__(self):
        return f"{self.quantity_ordered}x {self.product.name} @ ₹{self.unit_cost}"


class GoodsReceipt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='receipts')
    delivery_challan = models.CharField(max_length=100, blank=True, default="", verbose_name="Supplier Delivery Challan #")
    received_date = models.DateTimeField(auto_now_add=True)
    received_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True, default="")

    class Meta:
        verbose_name = "Goods Receipt"
        verbose_name_plural = "Goods Receipts"
        ordering = ['-received_date']

    def __str__(self):
        return f"Receipt for {self.purchase_order.po_number} on {self.received_date:%Y-%m-%d}"
