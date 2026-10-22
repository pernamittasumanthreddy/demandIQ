from rest_framework import serializers, viewsets, permissions, status
from rest_framework.response import Response
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .models import Scenario
from .services import ScenarioSimulationEngine
from apps.businesses.models import Business

class ScenarioSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Scenario
        fields = [
            'id', 'business', 'name', 'description', 'demand_growth_pct', 'lead_time_delta_days',
            'price_change_pct', 'cost_change_pct', 'safety_buffer_days', 'procurement_budget_limit',
            'projected_revenue', 'projected_margin_pct', 'required_cash', 'stockout_risk_count',
            'potential_lost_sales', 'simulation_breakdown', 'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = [
            'id', 'projected_revenue', 'projected_margin_pct', 'required_cash',
            'stockout_risk_count', 'potential_lost_sales', 'simulation_breakdown', 'created_at'
        ]

class ScenarioViewSet(viewsets.ModelViewSet):
    serializer_class = ScenarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        if business:
            return Scenario.objects.filter(business=business)
        return Scenario.objects.filter(business__memberships__user=self.request.user).distinct()

    def perform_create(self, serializer):
        business = getattr(self.request, 'business', None) or Business.objects.filter(memberships__user=self.request.user).first()
        scenario = serializer.save(business=business, created_by=self.request.user)
        ScenarioSimulationEngine.simulate(scenario)

router = DefaultRouter()
router.register(r'', ScenarioViewSet, basename='scenario')

urlpatterns = [
    path('', include(router.urls)),
]
