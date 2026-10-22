from decimal import Decimal
import pytest
from django.core.exceptions import ValidationError
from apps.businesses.models import Business, Branch
from apps.catalog.models import Product, ProductCategory
from apps.inventory.models import InventoryBalance, InventoryMovement, MovementType
from apps.inventory.services import InventoryService

@pytest.mark.django_db
def test_inventory_atomic_adjustment():
    business = Business.objects.create(name="Test Grocery")
    branch = Branch.objects.create(business=business, name="Branch 1", code="B1")
    cat = ProductCategory.objects.create(business=business, name="Grains")
    product = Product.objects.create(
        business=business,
        category=cat,
        sku="TEST-RICE",
        name="Test Rice",
        cost_price=Decimal('100.00'),
        selling_price=Decimal('120.00'),
        current_stock=Decimal('0.00')
    )

    # 1. Receipt adjustment (+50)
    mov1 = InventoryService.adjust_stock(
        product_id=product.id,
        branch_id=branch.id,
        delta_quantity=Decimal('50.00'),
        movement_type=MovementType.PURCHASE_RECEIPT
    )
    product.refresh_from_db()
    balance = InventoryBalance.objects.get(product=product, branch=branch)
    assert balance.quantity == Decimal('50.00')
    assert product.current_stock == Decimal('50.00')
    assert mov1.balance_after == Decimal('50.00')

    # 2. Sale reduction (-15)
    mov2 = InventoryService.adjust_stock(
        product_id=product.id,
        branch_id=branch.id,
        delta_quantity=Decimal('-15.00'),
        movement_type=MovementType.SALE
    )
    product.refresh_from_db()
    balance.refresh_from_db()
    assert balance.quantity == Decimal('35.00')
    assert product.current_stock == Decimal('35.00')
    assert mov2.balance_after == Decimal('35.00')

    # 3. Overselling prevention
    with pytest.raises(ValidationError):
        InventoryService.adjust_stock(
            product_id=product.id,
            branch_id=branch.id,
            delta_quantity=Decimal('-50.00'),  # only 35 available
            movement_type=MovementType.SALE
        )
