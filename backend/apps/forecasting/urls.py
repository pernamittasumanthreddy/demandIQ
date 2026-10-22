from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ForecastRunViewSet

router = DefaultRouter()
router.register(r'runs', ForecastRunViewSet, basename='forecast-run')

urlpatterns = [
    path('', include(router.urls)),
]
