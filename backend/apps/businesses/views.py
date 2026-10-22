from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Business, Branch, BusinessMembership, MemberRole
from .serializers import BusinessSerializer, BranchSerializer, BusinessMembershipSerializer

class BusinessViewSet(viewsets.ModelViewSet):
    serializer_class = BusinessSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Return businesses the user belongs to, or all active businesses for demo/public browsing
        if self.request.user.is_authenticated:
            return Business.objects.filter(memberships__user=self.request.user, is_active=True).distinct()
        return Business.objects.filter(is_active=True)

    def perform_create(self, serializer):
        business = serializer.save()
        # Automatically make creator the Business Owner
        BusinessMembership.objects.create(
            user=self.request.user,
            business=business,
            role=MemberRole.OWNER
        )
        # Create a default main branch
        Branch.objects.create(
            business=business,
            name="Main Store",
            code="HQ01",
            is_main=True,
            city="Bengaluru",
            state="Karnataka"
        )

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Return the active business context for the user."""
        business = getattr(request, 'business', None)
        if not business:
            business = self.get_queryset().first()
        if not business:
            return Response({'business': None, 'message': 'No active business registered'}, status=status.HTTP_200_OK)
        serializer = self.get_serializer(business)
        return Response({'business': serializer.data})

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny], url_path='seed-demo')
    def seed_demo(self, request):
        """One-click seed demo dataset."""
        from django.core.management import call_command
        try:
            call_command('seed_demandiq')
            return Response({'message': 'Demo business (Sri Lakshmi Supermarket & Kirana) seeded successfully with 180 days of Indian retail sales data, 4 suppliers, products, reorder recommendations, and dead-stock analyses.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BranchViewSet(viewsets.ModelViewSet):
    serializer_class = BranchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        if business:
            return Branch.objects.filter(business=business, is_active=True)
        return Branch.objects.filter(business__memberships__user=self.request.user, is_active=True).distinct()

    def perform_create(self, serializer):
        business = getattr(self.request, 'business', None)
        if not business:
            raise serializers.ValidationError("Active business context required to create a branch.")
        serializer.save(business=business)


class BusinessMembershipViewSet(viewsets.ModelViewSet):
    serializer_class = BusinessMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        if business:
            return BusinessMembership.objects.filter(business=business).select_related('user', 'business', 'branch')
        return BusinessMembership.objects.filter(business__memberships__user=self.request.user).select_related('user', 'business', 'branch').distinct()
