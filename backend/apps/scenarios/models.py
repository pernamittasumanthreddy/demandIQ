import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from apps.businesses.models import Business

class Scenario(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='scenarios')
    name = models.CharField(max_length=160, verbose_name="Scenario Title")
    description = models.TextField(blank=True, default="")
    
    # Input Assumptions
    demand_growth_pct = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), verbose_name="Demand Growth % (+/-)")
    lead_time_delta_days = models.IntegerField(default=0, verbose_name="Supplier Lead Time Shift (Days)")
    price_change_pct = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), verbose_name="Retail Price % (+/-)")
    cost_change_pct = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'), verbose_name="Wholesale Cost % (+/-)")
    safety_buffer_days = models.PositiveIntegerField(default=7, verbose_name="Safety Buffer Target (Days)")
    procurement_budget_limit = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="Budget Cap (₹, 0 = unlimited)")

    # Output Simulation Metrics
    projected_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    projected_margin_pct = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    required_cash = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    stockout_risk_count = models.PositiveIntegerField(default=0)
    potential_lost_sales = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    simulation_breakdown = models.JSONField(default=dict, blank=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Business Scenario"
        verbose_name_plural = "Business Scenarios"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} (Growth: {self.demand_growth_pct}%, Margin: {self.projected_margin_pct}%)"
