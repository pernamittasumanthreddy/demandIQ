from decimal import Decimal
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from .models import PurchaseOrder, PurchaseOrderItem, GoodsReceipt, PurchaseOrderStatus
from .serializers import PurchaseOrderSerializer, GoodsReceiptSerializer
from apps.inventory.services import InventoryService
from apps.inventory.models import MovementType
from apps.businesses.models import Business, Branch

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    serializer_class = PurchaseOrderSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        qs = PurchaseOrder.objects.select_related('supplier', 'branch').prefetch_related('items__product')
        if business:
            return qs.filter(business=business)
        elif self.request.user.is_authenticated:
            return qs.filter(business__memberships__user=self.request.user).distinct()
        return qs.all()

    @transaction.atomic
    def perform_create(self, serializer):
        business = getattr(self.request, 'business', None) or Business.objects.first()
        branch = getattr(self.request, 'branch', None) or Branch.objects.filter(business=business).first()

        items_data = self.request.data.get('items', [])
        po = serializer.save(business=business, branch=branch)

        subtotal = Decimal('0.00')
        tax_total = Decimal('0.00')

        for item in items_data:
            qty = Decimal(str(item.get('quantity_ordered', '1')))
            cost = Decimal(str(item.get('unit_cost', '0.00')))
            tax_rate = Decimal(str(item.get('tax_rate', '5.00')))
            line_net = qty * cost
            line_tax = line_net * (tax_rate / Decimal('100.00'))

            PurchaseOrderItem.objects.create(
                purchase_order=po,
                product_id=item['product'],
                quantity_ordered=qty,
                unit_cost=cost,
                tax_rate=tax_rate,
                line_total=line_net + line_tax
            )
            subtotal += line_net
            tax_total += line_tax

        po.subtotal = subtotal
        po.tax_amount = tax_total
        po.total_amount = subtotal + tax_total
        po.save()

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        po = self.get_object()
        po.status = PurchaseOrderStatus.APPROVED
        if request.user.is_authenticated:
            po.approved_by = request.user
        po.save()
        return Response({'message': f"Purchase Order {po.po_number} approved.", 'po': PurchaseOrderSerializer(po).data})

    @action(detail=True, methods=['post'], url_path='issue')
    def issue(self, request, pk=None):
        po = self.get_object()
        po.status = PurchaseOrderStatus.ORDERED
        po.save()
        return Response({'message': f"PO {po.po_number} marked as issued to supplier {po.supplier.name}."})

    @action(detail=True, methods=['post'], url_path='receive')
    @transaction.atomic
    def receive_goods(self, request, pk=None):
        """
        Receives goods from PO, increments inventory stock balance atomically,
        and logs the inventory transaction.
        """
        po = self.get_object()
        challan = request.data.get('delivery_challan', '')

        receipt = GoodsReceipt.objects.create(
            purchase_order=po,
            delivery_challan=challan,
            received_by=request.user if request.user.is_authenticated else None,
            notes=request.data.get('notes', 'Full shipment received')
        )

        for item in po.items.all():
            recv_qty = item.quantity_ordered - item.quantity_received
            if recv_qty > 0:
                item.quantity_received += recv_qty
                item.save()

                # Atomically adjust inventory stock
                InventoryService.adjust_stock(
                    product_id=item.product.id,
                    branch_id=po.branch.id,
                    delta_quantity=recv_qty,
                    movement_type=MovementType.PURCHASE_RECEIPT,
                    unit_cost=item.unit_cost,
                    reference_number=f"PO:{po.po_number}",
                    reason_notes=f"Goods Receipt challan #{challan}",
                    user=request.user if request.user.is_authenticated else None
                )

        po.status = PurchaseOrderStatus.RECEIVED
        po.save()

        return Response({
            'message': f"All goods for PO {po.po_number} successfully received into inventory.",
            'receipt': GoodsReceiptSerializer(receipt).data,
            'po': PurchaseOrderSerializer(po).data
        }, status=status.HTTP_200_OK)
