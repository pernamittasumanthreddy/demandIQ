import uuid
from decimal import Decimal
from django.db import models
from apps.businesses.models import Business, Branch
from apps.catalog.models import Product
from apps.suppliers.models import Supplier

class RecommendationUrgency(models.TextChoices):
    CRITICAL = 'CRITICAL', 'Critical Stockout Risk'
    WARNING = 'WARNING', 'Approaching Reorder Point'
    OPTIMAL = 'OPTIMAL', 'Optimal Stock Buffer'

class RecommendationStatus(models.TextChoices):
    PENDING = 'PENDING', 'Under Review'
    ACCEPTED = 'ACCEPTED', 'Approved by Manager'
    REJECTED = 'REJECTED', 'Dismissed'
    CONVERTED = 'CONVERTED', 'Converted to Purchase Order'

class DeadStockClassification(models.TextChoices):
    HEALTHY = 'HEALTHY', 'Fast / Healthy Movement'
    SLOW_MOVING = 'SLOW_MOVING', 'Slow-Moving Stock'
    POTENTIAL_EXCESS = 'POTENTIAL_EXCESS', 'Potential Excess Inventory'
    DEAD_STOCK = 'DEAD_STOCK', 'Confirmed Dead Stock (>60 Days Idle)'
    NEAR_EXPIRY = 'NEAR_EXPIRY', 'Expiring Within 30 Days'

class ReorderRecommendation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='recommendations')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='recommendations')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='recommendations')
    preferred_supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True)

    # Core Stock Parameters
    current_stock = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    inventory_position = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    avg_daily_demand = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    lead_time_days = models.PositiveIntegerField(default=3)
    safety_stock = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    reorder_point = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    # Recommended Action
    suggested_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    estimated_cost = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Procurement Cost (₹)")
    estimated_stockout_days = models.IntegerField(default=0, verbose_name="Days Until Runout")
    
    urgency = models.CharField(max_length=20, choices=RecommendationUrgency.choices, default=RecommendationUrgency.WARNING)
    status = models.CharField(max_length=20, choices=RecommendationStatus.choices, default=RecommendationStatus.PENDING)
    reason_notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Reorder Recommendation"
        verbose_name_plural = "Reorder Recommendations"
        ordering = ['-urgency', 'estimated_stockout_days']

    def __str__(self):
        return f"Reorder {self.suggested_quantity}x {self.product.name} (Urgency: {self.urgency})"


class DeadStockAnalysis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='dead_stock_analyses')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='dead_stock_analyses')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='dead_stock_records')
    classification = models.CharField(max_length=30, choices=DeadStockClassification.choices, default=DeadStockClassification.HEALTHY)
    days_without_sale = models.PositiveIntegerField(default=0)
    units_in_stock = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    capital_at_risk = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Idle Capital (₹)")
    turnover_ratio = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'))
    recommended_action = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Dead Stock Item"
        verbose_name_plural = "Dead Stock Items"
        ordering = ['-capital_at_risk']

    def __str__(self):
        return f"{self.product.name}: {self.get_classification_display()} (₹{self.capital_at_risk} tied up)"
