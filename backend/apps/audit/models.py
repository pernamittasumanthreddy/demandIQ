from django.db import models
from django.conf import settings
from apps.businesses.models import Business

class AuditEvent(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Created Entity'),
        ('UPDATE', 'Updated Entity'),
        ('DELETE', 'Deleted Entity'),
        ('STOCK_ADJUSTMENT', 'Stock Adjustment'),
        ('IMPORT_SALES', 'Sales Import Processed'),
        ('FORECAST_RUN', 'Forecast Engine Run'),
        ('PO_APPROVED', 'Purchase Order Approved'),
        ('GOODS_RECEIVED', 'Goods Received into Stock'),
        ('SCENARIO_SIMULATED', 'Scenario Simulated'),
        ('PERMISSION_CHANGE', 'Permission Changed'),
    ]

    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='audit_events')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_actions')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    entity_type = models.CharField(max_length=80, verbose_name="Target Entity Type")
    entity_id = models.CharField(max_length=80, blank=True, default="", verbose_name="Entity Identifier")
    description = models.TextField(verbose_name="Audit Summary")
    change_diff = models.JSONField(default=dict, blank=True, verbose_name="Structured Diff")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Audit Event"
        verbose_name_plural = "Audit Events"
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp:%Y-%m-%d %H:%M}] {self.get_action_display()} - {self.description[:50]}"
