import uuid
from decimal import Decimal
from django.db import models
from apps.businesses.models import Business, Branch
from apps.catalog.models import Product

class PaymentMethod(models.TextChoices):
    UPI = 'UPI', 'UPI (GooglePay / PhonePe / Paytm)'
    CASH = 'CASH', 'Cash'
    CARD = 'CARD', 'Credit / Debit Card'
    KHATA = 'KHATA', 'Credit / Customer Khata'
    BANK_TRANSFER = 'BANK_TRANSFER', 'NEFT / RTGS'

class CustomerType(models.TextChoices):
    WALK_IN = 'WALK_IN', 'Walk-in Retail Customer'
    REGULAR = 'REGULAR', 'Registered Regular Customer'
    B2B = 'B2B', 'Wholesale / B2B Commercial'

class SalesTransactionStatus(models.TextChoices):
    COMPLETED = 'COMPLETED', 'Completed Sale'
    CANCELLED = 'CANCELLED', 'Cancelled'
    RETURNED = 'RETURNED', 'Returned'

class SalesTransaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='sales_transactions')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='sales_transactions')
    invoice_number = models.CharField(max_length=80, verbose_name="Bill / Invoice Number")
    transaction_date = models.DateTimeField(verbose_name="Sale Timestamp")
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.UPI)
    customer_type = models.CharField(max_length=20, choices=CustomerType.choices, default=CustomerType.WALK_IN)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_tax = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_discount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Total Bill Amount (₹)")
    status = models.CharField(max_length=20, choices=SalesTransactionStatus.choices, default=SalesTransactionStatus.COMPLETED)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Sales Transaction"
        verbose_name_plural = "Sales Transactions"
        unique_together = ('business', 'invoice_number')
        ordering = ['-transaction_date']

    def __str__(self):
        return f"Invoice #{self.invoice_number} - ₹{self.net_amount} ({self.transaction_date:%Y-%m-%d})"


class SalesTransactionItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(SalesTransaction, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sales_items')
    quantity = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Quantity Sold")
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Unit Selling Price (₹)")
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Unit Cost Price (₹)")
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Line Net (₹)")
    is_returned = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Sales Item"
        verbose_name_plural = "Sales Items"

    @property
    def gross_profit(self):
        return self.subtotal - (self.quantity * self.unit_cost)

    def __str__(self):
        return f"{self.quantity}x {self.product.name} @ ₹{self.unit_price}"
