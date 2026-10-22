from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BusinessViewSet, BranchViewSet, BusinessMembershipViewSet

router = DefaultRouter()
router.register(r'branches', BranchViewSet, basename='branch')
router.register(r'memberships', BusinessMembershipViewSet, basename='membership')
router.register(r'', BusinessViewSet, basename='business')

urlpatterns = [
    path('', include(router.urls)),
]
