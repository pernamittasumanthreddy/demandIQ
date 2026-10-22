from .models import Business, BusinessMembership

class TenantMiddleware:
    """
    Middleware that identifies the active tenant (Business and Branch)
    from request headers ('X-Business-ID', 'X-Branch-ID'), query parameters,
    or the authenticated user's primary membership.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.business = None
        request.branch = None
        request.membership = None

        business_id = request.headers.get('X-Business-ID') or request.GET.get('business_id')

        if request.user.is_authenticated:
            if business_id:
                try:
                    membership = BusinessMembership.objects.select_related('business', 'branch').get(
                        user=request.user,
                        business_id=business_id,
                        is_active=True
                    )
                    request.membership = membership
                    request.business = membership.business
                    request.branch = membership.branch
                except BusinessMembership.DoesNotExist:
                    pass

            # Fallback to user's first active business if not explicitly provided or invalid
            if not request.business:
                membership = BusinessMembership.objects.select_related('business', 'branch').filter(
                    user=request.user,
                    is_active=True
                ).first()
                if membership:
                    request.membership = membership
                    request.business = membership.business
                    request.branch = membership.branch
        else:
            # Unauthenticated or public demo fallback if header passed
            if business_id:
                request.business = Business.objects.filter(id=business_id, is_active=True).first()

        response = self.get_response(request)
        return response
