import uuid
from decimal import Decimal
from django.db import models
from apps.businesses.models import Business

class ProductCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=120, verbose_name="Category Name")
    slug = models.SlugField(max_length=140, blank=True)
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Product Category"
        verbose_name_plural = "Product Categories"
        unique_together = ('business', 'name')
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.business.name})"


class UnitOfMeasure(models.TextChoices):
    KG = 'KG', 'Kilogram (kg)'
    G = 'G', 'Gram (g)'
    L = 'L', 'Litre (L)'
    ML = 'ML', 'Millilitre (ml)'
    PIECE = 'PCS', 'Pieces (pcs)'
    PACK = 'PACK', 'Pack / Packet'
    BOX = 'BOX', 'Box / Carton'
    STRIP = 'STRIP', 'Strip (Tablets)'

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(ProductCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    sku = models.CharField(max_length=80, verbose_name="Stock Keeping Unit (SKU)")
    barcode = models.CharField(max_length=60, blank=True, default="", verbose_name="Barcode / EAN")
    name = models.CharField(max_length=200, verbose_name="Product Name")
    description = models.TextField(blank=True, default="")
    brand = models.CharField(max_length=100, blank=True, default="")
    unit = models.CharField(max_length=20, choices=UnitOfMeasure.choices, default=UnitOfMeasure.PIECE)
    
    # Financial fields with Decimal precision
    cost_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Unit Cost Price (₹)")
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Selling Price / MRP (₹)")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('5.00'), verbose_name="GST Rate (%)")

    # Inventory policy & parameters
    current_stock = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Current Physical Stock")
    min_threshold = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('10.00'), verbose_name="Reorder Level Threshold")
    max_target = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('100.00'), verbose_name="Target Ceiling Stock")
    lead_time_days = models.PositiveIntegerField(default=3, verbose_name="Supplier Lead Time (Days)")
    moq = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('1.00'), verbose_name="Minimum Order Quantity (MOQ)")
    order_multiple = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('1.00'), verbose_name="Pack / Order Multiple")
    
    # Expiry & Shelf life
    is_perishable = models.BooleanField(default=False, verbose_name="Perishable Item")
    shelf_life_days = models.PositiveIntegerField(default=0, verbose_name="Shelf Life (Days, 0 if non-perishable)")

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"
        unique_together = ('business', 'sku')
        ordering = ['name']

    @property
    def gross_margin_percent(self):
        if self.selling_price and self.selling_price > 0:
            margin = ((self.selling_price - self.cost_price) / self.selling_price) * 100
            return round(margin, 2)
        return Decimal('0.00')

    @property
    def stock_status(self):
        if self.current_stock <= 0:
            return "OUT_OF_STOCK"
        elif self.current_stock <= self.min_threshold:
            return "LOW_STOCK"
        elif self.current_stock >= self.max_target:
            return "OVERSTOCKED"
        return "OPTIMAL"

    def __str__(self):
        return f"{self.name} [{self.sku}] - ₹{self.selling_price}"
