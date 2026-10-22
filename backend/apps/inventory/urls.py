from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryBalanceViewSet, InventoryMovementViewSet, InventoryBatchViewSet

router = DefaultRouter()
router.register(r'balances', InventoryBalanceViewSet, basename='inventory-balance')
router.register(r'movements', InventoryMovementViewSet, basename='inventory-movement')
router.register(r'batches', InventoryBatchViewSet, basename='inventory-batch')

urlpatterns = [
    path('', include(router.urls)),
]
