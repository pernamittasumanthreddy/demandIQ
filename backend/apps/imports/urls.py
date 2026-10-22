from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalesImportViewSet

router = DefaultRouter()
router.register(r'', SalesImportViewSet, basename='sales-import')

urlpatterns = [
    path('', include(router.urls)),
]
