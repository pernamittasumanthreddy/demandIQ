from decimal import Decimal
import pytest
from apps.businesses.models import Business, Branch
from apps.catalog.models import Product, ProductCategory

@pytest.mark.django_db
def test_tenant_isolation_products():
    biz_a = Business.objects.create(name="Business A Kirana")
    biz_b = Business.objects.create(name="Business B Pharmacy")

    cat_a = ProductCategory.objects.create(business=biz_a, name="A Groceries")
    cat_b = ProductCategory.objects.create(business=biz_b, name="B Medicines")

    p_a = Product.objects.create(
        business=biz_a,
        category=cat_a,
        sku="SKU-A",
        name="Rice A",
        cost_price=Decimal('100.00'),
        selling_price=Decimal('120.00')
    )
    p_b = Product.objects.create(
        business=biz_b,
        category=cat_b,
        sku="SKU-B",
        name="Paracetamol B",
        cost_price=Decimal('20.00'),
        selling_price=Decimal('30.00')
    )

    # Scoped query for Business A must never return Business B products
    products_a = Product.objects.filter(business=biz_a)
    assert p_a in products_a
    assert p_b not in products_a

    products_b = Product.objects.filter(business=biz_b)
    assert p_b in products_b
    assert p_a not in products_b
