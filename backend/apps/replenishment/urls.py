from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReorderRecommendationViewSet, DeadStockViewSet

router = DefaultRouter()
router.register(r'recommendations', ReorderRecommendationViewSet, basename='reorder-recommendation')
router.register(r'dead-stock', DeadStockViewSet, basename='dead-stock')

urlpatterns = [
    path('', include(router.urls)),
]
