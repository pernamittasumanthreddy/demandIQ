from django.urls import path
from .views import WeeklyStockReviewView, InventoryValuationReportView

urlpatterns = [
    path('weekly-review/', WeeklyStockReviewView.as_view(), name='reporting-weekly-review'),
    path('valuation/', InventoryValuationReportView.as_view(), name='reporting-valuation'),
]
