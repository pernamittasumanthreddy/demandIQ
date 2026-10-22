from rest_framework import serializers
from .models import Business, Branch, BusinessMembership

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = ['id', 'business', 'name', 'code', 'is_main', 'address_line', 'city', 'state', 'pincode', 'phone', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class BusinessSerializer(serializers.ModelSerializer):
    branches = BranchSerializer(many=True, read_only=True)
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = Business
        fields = [
            'id', 'name', 'slug', 'industry_type', 'gstin', 'pan', 'phone', 'email',
            'currency', 'currency_symbol', 'timezone', 'fiscal_year_start', 'is_active',
            'created_at', 'branches', 'user_role'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'user_role']

    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            m = BusinessMembership.objects.filter(user=request.user, business=obj).first()
            return m.role if m else None
        return None

class BusinessMembershipSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    business_name = serializers.CharField(source='business.name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)

    class Meta:
        model = BusinessMembership
        fields = ['id', 'user', 'user_email', 'user_name', 'business', 'business_name', 'branch', 'branch_name', 'role', 'is_active', 'joined_at']
        read_only_fields = ['id', 'joined_at']
