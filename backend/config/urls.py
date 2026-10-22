from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),

    # OpenAPI 3 Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # API v1 Endpoints
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/businesses/', include('apps.businesses.urls')),
    path('api/v1/catalog/', include('apps.catalog.urls')),
    path('api/v1/inventory/', include('apps.inventory.urls')),
    path('api/v1/suppliers/', include('apps.suppliers.urls')),
    path('api/v1/sales/', include('apps.sales.urls')),
    path('api/v1/imports/', include('apps.imports.urls')),
    path('api/v1/analytics/', include('apps.analytics.urls')),
    path('api/v1/forecasting/', include('apps.forecasting.urls')),
    path('api/v1/replenishment/', include('apps.replenishment.urls')),
    path('api/v1/procurement/', include('apps.procurement.urls')),
    path('api/v1/scenarios/', include('apps.scenarios.urls')),
    path('api/v1/reporting/', include('apps.reporting.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    path('api/v1/audit/', include('apps.audit.urls')),
]
