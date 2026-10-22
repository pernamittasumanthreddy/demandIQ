from rest_framework import serializers, viewsets, permissions
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .models import AuditEvent

class AuditEventSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)
    actor_email = serializers.EmailField(source='actor.email', read_only=True)

    class Meta:
        model = AuditEvent
        fields = ['id', 'business', 'actor', 'actor_name', 'actor_email', 'action', 'entity_type', 'entity_id', 'description', 'change_diff', 'ip_address', 'timestamp']
        read_only_fields = ['id', 'timestamp']

class AuditEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        if business:
            return AuditEvent.objects.filter(business=business).select_related('actor')
        return AuditEvent.objects.filter(business__memberships__user=self.request.user).select_related('actor').distinct()

router = DefaultRouter()
router.register(r'', AuditEventViewSet, basename='audit')

urlpatterns = [
    path('', include(router.urls)),
]
