from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'designation', 'is_verified', 'created_at']
        read_only_fields = ['id', 'created_at', 'is_verified']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    business_name = serializers.CharField(write_only=True, required=False, default="")

    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 'phone', 'password', 'business_name']

    def create(self, validated_data):
        business_name = validated_data.pop('business_name', '')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        user = authenticate(username=email, password=password)
        if not user:
            # Fallback check by username
            try:
                u = User.objects.get(email=email)
                user = authenticate(username=u.username, password=password)
            except User.DoesNotExist:
                pass
        if not user:
            raise serializers.ValidationError("Invalid email or password credentials.")
        if not user.is_active:
            raise serializers.ValidationError("Account is inactive.")
        data['user'] = user
        return data
