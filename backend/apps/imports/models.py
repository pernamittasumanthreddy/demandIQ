import uuid
from django.db import models
from django.conf import settings
from apps.businesses.models import Business, Branch

class ImportStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Validation'
    VALIDATING = 'VALIDATING', 'Validating File Content'
    VALIDATED = 'VALIDATED', 'Validation Passed'
    HAS_ERRORS = 'HAS_ERRORS', 'Validation Warnings / Errors'
    PROCESSING = 'PROCESSING', 'Importing Records'
    COMPLETED = 'COMPLETED', 'Successfully Completed'
    FAILED = 'FAILED', 'Import Failed'
    ROLLED_BACK = 'ROLLED_BACK', 'Rolled Back'

class SalesImport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='sales_imports')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='sales_imports')
    filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10, default="CSV")
    status = models.CharField(max_length=20, choices=ImportStatus.choices, default=ImportStatus.PENDING)
    total_rows = models.PositiveIntegerField(default=0)
    valid_rows = models.PositiveIntegerField(default=0)
    error_rows = models.PositiveIntegerField(default=0)
    column_mapping = models.JSONField(default=dict, blank=True)
    sample_preview = models.JSONField(default=list, blank=True)
    error_summary = models.JSONField(default=list, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Sales Import"
        verbose_name_plural = "Sales Imports"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.filename} ({self.get_status_display()}) - {self.valid_rows}/{self.total_rows} rows"


class SalesImportError(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sales_import = models.ForeignKey(SalesImport, on_delete=models.CASCADE, related_name='errors')
    row_number = models.PositiveIntegerField()
    column_name = models.CharField(max_length=100)
    invalid_value = models.TextField(blank=True, default="")
    error_message = models.TextField()
    is_corrected = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Sales Import Error"
        verbose_name_plural = "Sales Import Errors"
        ordering = ['row_number']

    def __str__(self):
        return f"Row #{self.row_number} [{self.column_name}]: {self.error_message}"
