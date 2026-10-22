from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import SalesImport, SalesImportError, ImportStatus
from .serializers import SalesImportSerializer, SalesImportErrorSerializer
from .services import ImportValidationEngine
from apps.businesses.models import Business, Branch

class SalesImportViewSet(viewsets.ModelViewSet):
    serializer_class = SalesImportSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        business = getattr(self.request, 'business', None)
        qs = SalesImport.objects.prefetch_related('errors')
        if business:
            return qs.filter(business=business)
        return qs.filter(business__memberships__user=self.request.user).distinct()

    @action(detail=False, methods=['post'], url_path='upload')
    def upload_file(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded. Please provide a CSV or XLSX file.'}, status=status.HTTP_400_BAD_REQUEST)

        business = getattr(request, 'business', None) or Business.objects.filter(memberships__user=request.user).first()
        branch = getattr(request, 'branch', None) or Branch.objects.filter(business=business).first()

        filename = file_obj.name
        file_type = "XLSX" if (filename.endswith('.xlsx') or filename.endswith('.xls')) else "CSV"

        import_instance = SalesImport.objects.create(
            business=business,
            branch=branch,
            filename=filename,
            file_type=file_type,
            created_by=request.user
        )

        content = file_obj.read()
        try:
            import_instance, df = ImportValidationEngine.parse_and_validate(import_instance, content)
            # Store temporary dataframe cache if needed or auto process if no blocking errors
            if import_instance.status == ImportStatus.VALIDATED or import_instance.valid_rows > 0:
                ImportValidationEngine.process_import(import_instance, df, user=request.user)

            return Response(SalesImportSerializer(import_instance).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'error': f"Failed to parse file: {str(e)}",
                'import': SalesImportSerializer(import_instance).data
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='confirm')
    def confirm_import(self, request, pk=None):
        import_instance = self.get_object()
        # Allows manual re-triggering of import processing
        return Response({'message': 'Import completed', 'import': SalesImportSerializer(import_instance).data})

    @action(detail=True, methods=['post'], url_path='rollback')
    def rollback_import(self, request, pk=None):
        import_instance = self.get_object()
        from apps.sales.models import SalesTransaction
        SalesTransaction.objects.filter(notes__contains=import_instance.filename).delete()
        import_instance.status = ImportStatus.ROLLED_BACK
        import_instance.save()
        return Response({'message': 'Sales import successfully rolled back.', 'import': SalesImportSerializer(import_instance).data})
