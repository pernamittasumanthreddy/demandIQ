from decimal import Decimal
from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from .models import SalesTransaction, SalesTransactionItem
from .serializers import SalesTransactionSerializer, SalesTransactionItemSerializer
from apps.inventory.services import InventoryService
from apps.inventory.models import MovementType
from apps.businesses.models import Business, Branch

class SalesTransactionViewSet(viewsets.ModelViewSet):
    serializer_class = SalesTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['invoice_number', 'items__product__name', 'items__product__sku']
    ordering_fields = ['transaction_date', 'net_amount']

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        qs = SalesTransaction.objects.prefetch_related('items__product').select_related('branch')
        if business:
            qs = qs.filter(business=business)
        else:
            qs = qs.filter(business__memberships__user=self.request.user).distinct()
        
        branch_id = self.request.query_params.get('branch')
        if branch_id:
            qs = qs.filter(branch_id=branch_id)

        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            qs = qs.filter(transaction_date__date__gte=start_date)
        if end_date:
            qs = qs.filter(transaction_date__date__lte=end_date)

        return qs

    @transaction.atomic
    def perform_create(self, serializer):
        business = getattr(self.request, 'business', None)
        if not business:
            business = Business.objects.filter(memberships__user=self.request.user).first()
        branch = getattr(self.request, 'branch', None) or Branch.objects.filter(business=business).first()

        tx = serializer.save(business=business, branch=branch)
        # Deduct inventory if items were supplied
        items_data = self.request.data.get('items', [])
        for item in items_data:
            product_id = item.get('product')
            quantity = Decimal(str(item.get('quantity', '1')))
            unit_price = Decimal(str(item.get('unit_price', '0.00')))
            unit_cost = Decimal(str(item.get('unit_cost', '0.00')))
            discount = Decimal(str(item.get('discount', '0.00')))
            subtotal = (quantity * unit_price) - discount

            SalesTransactionItem.objects.create(
                transaction=tx,
                product_id=product_id,
                quantity=quantity,
                unit_price=unit_price,
                unit_cost=unit_cost,
                discount=discount,
                subtotal=subtotal
            )

            # Auto reduce stock
            InventoryService.adjust_stock(
                product_id=product_id,
                branch_id=branch.id,
                delta_quantity=-quantity,
                movement_type=MovementType.SALE,
                reference_number=tx.invoice_number,
                reason_notes=f"Sale Invoice #{tx.invoice_number}",
                user=self.request.user
            )
