import uuid
from decimal import Decimal
from django.db import models
from apps.businesses.models import Business, Branch
from apps.catalog.models import Product

class ForecastStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Execution'
    RUNNING = 'RUNNING', 'Model Evaluation & Training'
    COMPLETED = 'COMPLETED', 'Completed'
    FAILED = 'FAILED', 'Failed'

class ForecastRun(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='forecast_runs')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, null=True, blank=True, related_name='forecast_runs')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='forecast_runs')
    horizon_days = models.PositiveIntegerField(default=14, verbose_name="Horizon (Days)")
    status = models.CharField(max_length=20, choices=ForecastStatus.choices, default=ForecastStatus.PENDING)
    selected_model = models.CharField(max_length=120, blank=True, default="")
    metrics = models.JSONField(default=dict, blank=True, verbose_name="Validation Metrics (MAE, RMSE, WAPE, etc.)")
    candidate_evaluations = models.JSONField(default=list, blank=True)
    explainability = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Forecast Run"
        verbose_name_plural = "Forecast Runs"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} ({self.horizon_days}d) - {self.selected_model} [{self.status}]"


class ForecastResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    forecast_run = models.ForeignKey(ForecastRun, on_delete=models.CASCADE, related_name='results')
    forecast_date = models.DateField(verbose_name="Predicted Calendar Date")
    predicted_demand = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    lower_bound = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="80% Lower Bound")
    upper_bound = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'), verbose_name="80% Upper Bound")

    class Meta:
        verbose_name = "Forecast Result"
        verbose_name_plural = "Forecast Results"
        ordering = ['forecast_date']

    def __str__(self):
        return f"{self.forecast_date}: {self.predicted_demand} ({self.lower_bound} - {self.upper_bound})"
