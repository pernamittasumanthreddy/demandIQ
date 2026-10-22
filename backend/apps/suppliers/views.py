from rest_framework import viewsets, permissions, filters
from .models import Supplier, SupplierProduct
from .serializers import SupplierSerializer, SupplierProductSerializer
from apps.businesses.models import Business

class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'contact_person', 'phone', 'email']
    ordering_fields = ['name', 'typical_lead_time_days', 'rating', 'created_at']

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        qs = Supplier.objects.prefetch_related('supplied_products__product')
        if business:
            return qs.filter(business=business)
        elif self.request.user.is_authenticated:
            return qs.filter(business__memberships__user=self.request.user).distinct()
        return qs.all()

    def perform_create(self, serializer):
        business = getattr(self.request, 'business', None) or Business.objects.first()
        serializer.save(business=business)


class SupplierProductViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        qs = SupplierProduct.objects.select_related('supplier', 'product')
        if business:
            return qs.filter(supplier__business=business)
        elif self.request.user.is_authenticated:
            return qs.filter(supplier__business__memberships__user=self.request.user).distinct()
        return qs.all()
