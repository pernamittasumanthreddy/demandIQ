from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    email = models.EmailField(unique=True, verbose_name="Email Address")
    phone = models.CharField(max_length=20, blank=True, default="", verbose_name="Phone Number")
    designation = models.CharField(max_length=100, blank=True, default="", verbose_name="Designation")
    is_verified = models.BooleanField(default=True, verbose_name="Email Verified")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.email})"
