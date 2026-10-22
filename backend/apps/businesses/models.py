import uuid
from django.db import models
from django.conf import settings
from django.utils.text import slugify

class IndustryType(models.TextChoices):
    GROCERY = 'GROCERY', 'Grocery & Supermarket (Kirana)'
    PHARMACY = 'PHARMACY', 'Pharmacy & Medical Store'
    STATIONERY = 'STATIONERY', 'Stationery & Bookstore'
    ELECTRONICS = 'ELECTRONICS', 'Electronics & Hardware'
    WHOLESALE = 'WHOLESALE', 'Wholesale & FMCG Distributor'
    RETAIL_GENERAL = 'RETAIL_GENERAL', 'General Retail'

class MemberRole(models.TextChoices):
    PLATFORM_ADMIN = 'PLATFORM_ADMIN', 'Platform Administrator'
    OWNER = 'OWNER', 'Business Owner'
    MANAGER = 'MANAGER', 'Business Manager'
    INVENTORY_MGR = 'INVENTORY_MGR', 'Inventory Manager'
    SALES_ANALYST = 'SALES_ANALYST', 'Sales Analyst'
    VIEWER = 'VIEWER', 'Read-Only Viewer'

class Business(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name="Business Name")
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    industry_type = models.CharField(max_length=30, choices=IndustryType.choices, default=IndustryType.GROCERY)
    gstin = models.CharField(max_length=15, blank=True, default="", verbose_name="GSTIN Number")
    pan = models.CharField(max_length=10, blank=True, default="", verbose_name="PAN Number")
    phone = models.CharField(max_length=20, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    currency = models.CharField(max_length=5, default="INR", verbose_name="Currency Code")
    currency_symbol = models.CharField(max_length=5, default="₹", verbose_name="Currency Symbol")
    timezone = models.CharField(max_length=50, default="Asia/Kolkata")
    fiscal_year_start = models.IntegerField(default=4, verbose_name="Fiscal Year Start Month (4=April)")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Business"
        verbose_name_plural = "Businesses"
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name) or "business"
            candidate = base_slug
            idx = 1
            while Business.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base_slug}-{idx}"
                idx += 1
            self.slug = candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.get_industry_type_display()})"


class Branch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='branches')
    name = models.CharField(max_length=150, verbose_name="Branch Name")
    code = models.CharField(max_length=30, verbose_name="Branch Code")
    is_main = models.BooleanField(default=False, verbose_name="Main Headquarters/Store")
    address_line = models.CharField(max_length=255, blank=True, default="")
    city = models.CharField(max_length=100, default="Bengaluru")
    state = models.CharField(max_length=100, default="Karnataka")
    pincode = models.CharField(max_length=10, default="560001")
    phone = models.CharField(max_length=20, blank=True, default="")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Branch"
        verbose_name_plural = "Branches"
        unique_together = ('business', 'code')
        ordering = ['-is_main', 'name']

    def __str__(self):
        return f"{self.name} ({self.code}) - {self.business.name}"


class BusinessMembership(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='memberships')
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='memberships')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_members')
    role = models.CharField(max_length=25, choices=MemberRole.choices, default=MemberRole.OWNER)
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Business Membership"
        verbose_name_plural = "Business Memberships"
        unique_together = ('user', 'business')

    def __str__(self):
        return f"{self.user.email} - {self.business.name} ({self.role})"


class TenantScopedModel(models.Model):
    """
    Abstract base model enforcing tenant isolation across all enterprise business models.
    """
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='%(class)ss')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, null=True, blank=True, related_name='%(class)ss')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
