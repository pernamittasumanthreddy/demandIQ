from django.urls import path
from .views import SalesOverviewAnalyticsView

urlpatterns = [
    path('overview/', SalesOverviewAnalyticsView.as_view(), name='analytics-overview'),
]
