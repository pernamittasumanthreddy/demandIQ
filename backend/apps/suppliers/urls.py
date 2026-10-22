from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SupplierViewSet, SupplierProductViewSet

router = DefaultRouter()
router.register(r'contracts', SupplierProductViewSet, basename='supplier-product')
router.register(r'', SupplierViewSet, basename='supplier')

urlpatterns = [
    path('', include(router.urls)),
]
