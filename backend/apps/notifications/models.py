import uuid
from django.db import models
from django.conf import settings
from apps.businesses.models import Business

class NotificationSeverity(models.TextChoices):
    INFO = 'INFO', 'Informational'
    WARNING = 'WARNING', 'Warning Alert'
    CRITICAL = 'CRITICAL', 'Critical Alert'

class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='notifications')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    severity = models.CharField(max_length=20, choices=NotificationSeverity.choices, default=NotificationSeverity.INFO)
    link_url = models.CharField(max_length=255, blank=True, default="")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.severity}] {self.title}"
