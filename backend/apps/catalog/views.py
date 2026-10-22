from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import ProductCategory, Product
from .serializers import ProductCategorySerializer, ProductSerializer
from apps.businesses.models import Business

class ProductCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = ProductCategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        if business:
            return ProductCategory.objects.filter(business=business).prefetch_related('products')
        return ProductCategory.objects.all().distinct()

    def perform_create(self, serializer):
        business = getattr(self.request, 'business', None)
        if not business:
            business = Business.objects.first()
        serializer.save(business=business)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'sku', 'barcode', 'brand', 'category__name']
    ordering_fields = ['name', 'current_stock', 'selling_price', 'cost_price', 'created_at']

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        qs = Product.objects.all().select_related('category', 'business')
        if business:
            qs = qs.filter(business=business)
        elif self.request.user.is_authenticated:
            qs = qs.filter(business__memberships__user=self.request.user).distinct()

        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)

        status_filter = self.request.query_params.get('stock_status')
        if status_filter == 'OUT_OF_STOCK':
            qs = qs.filter(current_stock__lte=0)
        elif status_filter == 'LOW_STOCK':
            qs = qs.filter(current_stock__gt=0, current_stock__lte=models.F('min_threshold'))
        elif status_filter == 'OVERSTOCKED':
            qs = qs.filter(current_stock__gte=models.F('max_target'))

        return qs

    def perform_create(self, serializer):
        business = getattr(self.request, 'business', None)
        if not business:
            business = Business.objects.filter(memberships__user=self.request.user).first()
        serializer.save(business=business)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        qs = self.get_queryset()
        total_products = qs.count()
        low_stock = sum(1 for p in qs if p.stock_status == 'LOW_STOCK')
        out_of_stock = sum(1 for p in qs if p.stock_status == 'OUT_OF_STOCK')
        total_valuation = sum(p.current_stock * p.cost_price for p in qs)

        return Response({
            'total_products': total_products,
            'low_stock_count': low_stock,
            'out_of_stock_count': out_of_stock,
            'inventory_valuation': float(total_valuation),
        })
