import uuid
from decimal import Decimal
from django.db import models
from apps.businesses.models import Business
from apps.catalog.models import Product

class Supplier(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='suppliers')
    name = models.CharField(max_length=200, verbose_name="Supplier / Distributor Name")
    contact_person = models.CharField(max_length=120, blank=True, default="")
    phone = models.CharField(max_length=25, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    address = models.TextField(blank=True, default="")
    gstin = models.CharField(max_length=15, blank=True, default="", verbose_name="Supplier GSTIN")
    typical_lead_time_days = models.PositiveIntegerField(default=4, verbose_name="Default Lead Time (Days)")
    min_order_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Minimum Order Value (₹)")
    payment_terms = models.CharField(max_length=80, default="Net 15 Days", verbose_name="Payment Terms")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=Decimal('4.5'), verbose_name="Reliability Score (1-5)")
    notes = models.TextField(blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Supplier"
        verbose_name_plural = "Suppliers"
        unique_together = ('business', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} (Lead Time: {self.typical_lead_time_days}d)"


class SupplierProduct(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, related_name='supplied_products')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_suppliers')
    supplier_sku = models.CharField(max_length=80, blank=True, default="")
    contracted_unit_cost = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Wholesale Cost (₹)")
    moq = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('1.00'), verbose_name="Supplier MOQ")
    lead_time_days = models.PositiveIntegerField(default=3)
    is_preferred = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Supplier Product Contract"
        verbose_name_plural = "Supplier Product Contracts"
        unique_together = ('supplier', 'product')
        ordering = ['-is_preferred', 'contracted_unit_cost']

    def __str__(self):
        return f"{self.supplier.name} -> {self.product.name} (₹{self.contracted_unit_cost})"
