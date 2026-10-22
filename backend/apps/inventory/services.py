from decimal import Decimal
from django.db import transaction, models
from django.core.exceptions import ValidationError
from .models import InventoryBalance, InventoryMovement, MovementType
from apps.catalog.models import Product

class InventoryService:
    @staticmethod
    @transaction.atomic
    def adjust_stock(
        product_id,
        branch_id,
        delta_quantity: Decimal,
        movement_type: str,
        unit_cost: Decimal = Decimal('0.00'),
        reference_number: str = "",
        reason_notes: str = "",
        user=None
    ) -> InventoryMovement:
        """
        Atomically adjust product stock at a branch with concurrency locking (select_for_update).
        Guarantees that negative stock isn't produced unless explicitly allowed.
        """
        # Lock product
        product = Product.objects.select_for_update().get(id=product_id)
        
        # Lock or get inventory balance for branch
        balance, _ = InventoryBalance.objects.select_for_update().get_or_create(
            business=product.business,
            branch_id=branch_id,
            product=product,
            defaults={'quantity': Decimal('0.00')}
        )

        new_branch_qty = balance.quantity + delta_quantity
        if new_branch_qty < 0 and movement_type in [MovementType.SALE, MovementType.DAMAGED_EXPIRY]:
            raise ValidationError(
                f"Insufficient stock for {product.name}. Available: {balance.quantity}, Requested reduction: {abs(delta_quantity)}"
            )

        balance.quantity = new_branch_qty
        balance.save()

        # Update aggregated catalog product stock across all branches
        total_stock = InventoryBalance.objects.filter(product=product).aggregate(
            total=models.Sum('quantity') if hasattr(models, 'Sum') else None
        )
        # Or direct calculation
        balances_sum = sum((b.quantity for b in InventoryBalance.objects.filter(product=product)), Decimal('0.00'))
        product.current_stock = balances_sum
        product.save(update_fields=['current_stock', 'updated_at'])

        # Create audit movement
        movement = InventoryMovement.objects.create(
            business=product.business,
            branch_id=branch_id,
            product=product,
            movement_type=movement_type,
            quantity=delta_quantity,
            balance_after=new_branch_qty,
            unit_cost=unit_cost or product.cost_price,
            reference_number=reference_number,
            reason_notes=reason_notes,
            created_by=user
        )

        return movement
