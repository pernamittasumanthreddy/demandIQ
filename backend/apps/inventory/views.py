from decimal import Decimal
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import InventoryBalance, InventoryMovement, InventoryBatch
from .serializers import InventoryBalanceSerializer, InventoryMovementSerializer, InventoryAdjustmentSerializer, InventoryBatchSerializer
from .services import InventoryService

class InventoryBalanceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InventoryBalanceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        qs = InventoryBalance.objects.select_related('product', 'branch', 'product__category')
        if business:
            return qs.filter(business=business)
        elif self.request.user.is_authenticated:
            return qs.filter(business__memberships__user=self.request.user).distinct()
        return qs.all()

    @action(detail=False, methods=['post'], url_path='adjust')
    def adjust_stock(self, request):
        serializer = InventoryAdjustmentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        try:
            movement = InventoryService.adjust_stock(
                product_id=data['product_id'],
                branch_id=data['branch_id'],
                delta_quantity=data['delta_quantity'],
                movement_type=data['movement_type'],
                reference_number=data.get('reference_number', ''),
                reason_notes=data.get('reason_notes', ''),
                user=request.user if request.user.is_authenticated else None
            )
            return Response(InventoryMovementSerializer(movement).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class InventoryMovementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InventoryMovementSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        qs = InventoryMovement.objects.select_related('product', 'branch', 'created_by')
        if business:
            return qs.filter(business=business)
        elif self.request.user.is_authenticated:
            return qs.filter(business__memberships__user=self.request.user).distinct()
        return qs.all()


class InventoryBatchViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryBatchSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        qs = InventoryBatch.objects.select_related('product', 'branch')
        if business:
            return qs.filter(business=business)
        elif self.request.user.is_authenticated:
            return qs.filter(business__memberships__user=self.request.user).distinct()
        return qs.all()
