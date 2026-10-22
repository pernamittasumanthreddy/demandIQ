from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import ReorderRecommendation, DeadStockAnalysis, RecommendationStatus
from .serializers import ReorderRecommendationSerializer, DeadStockAnalysisSerializer
from .services import ReplenishmentEngine, DeadStockAnalyzer
from apps.businesses.models import Business, Branch

class ReorderRecommendationViewSet(viewsets.ModelViewSet):
    serializer_class = ReorderRecommendationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        qs = ReorderRecommendation.objects.select_related('product', 'preferred_supplier', 'branch')
        if business:
            return qs.filter(business=business)
        return qs.all()

    @action(detail=False, methods=['post'], url_path='recalculate')
    def recalculate(self, request):
        business = getattr(request, 'business', None) or Business.objects.filter(memberships__user=request.user).first()
        branch = getattr(request, 'branch', None) or Branch.objects.filter(business=business).first()
        
        recs = ReplenishmentEngine.generate_recommendations_for_business(business, branch)
        return Response({
            'message': f"Generated {len(recs)} reorder recommendations based on lead times and demand forecast.",
            'count': len(recs)
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='accept')
    def accept(self, request, pk=None):
        rec = self.get_object()
        rec.status = RecommendationStatus.ACCEPTED
        rec.save()
        return Response(ReorderRecommendationSerializer(rec).data)


class DeadStockViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DeadStockAnalysisSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        qs = DeadStockAnalysis.objects.select_related('product', 'product__category')
        if business:
            return qs.filter(business=business)
        return qs.all()

    @action(detail=False, methods=['post'], url_path='scan')
    def scan(self, request):
        business = getattr(request, 'business', None) or Business.objects.filter(memberships__user=request.user).first()
        branch = getattr(request, 'branch', None) or Branch.objects.filter(business=business).first()

        results = DeadStockAnalyzer.evaluate_dead_stock(business, branch)
        total_risk = sum(r.capital_at_risk for r in results if r.classification != 'HEALTHY')
        return Response({
            'message': f"Scan complete: analyzed {len(results)} inventory items.",
            'flagged_items': len(results),
            'total_capital_at_risk': float(total_risk)
        }, status=status.HTTP_200_OK)
