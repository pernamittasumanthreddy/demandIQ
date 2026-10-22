from rest_framework import serializers
from .models import SalesImport, SalesImportError

class SalesImportErrorSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesImportError
        fields = ['id', 'row_number', 'column_name', 'invalid_value', 'error_message', 'is_corrected']

class SalesImportSerializer(serializers.ModelSerializer):
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    error_list = SalesImportErrorSerializer(source='errors', many=True, read_only=True)

    class Meta:
        model = SalesImport
        fields = [
            'id', 'business', 'branch', 'branch_name', 'filename', 'file_type',
            'status', 'status_display', 'total_rows', 'valid_rows', 'error_rows',
            'column_mapping', 'sample_preview', 'error_summary', 'error_list',
            'created_by', 'created_by_name', 'created_at', 'completed_at'
        ]
        read_only_fields = ['id', 'status', 'total_rows', 'valid_rows', 'error_rows', 'created_at', 'completed_at']
