from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = ("email", "username", "role", "password")

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_username(self, value):
        value = value.strip()
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_role(self, value):
        # Public self-registration must never grant privileged roles.
        if value != User.Role.USER:
            raise serializers.ValidationError(
                "This role cannot be assigned during public registration."
            )
        return value

    def validate(self, attrs):
        candidate = User(
            email=attrs.get("email", ""),
            username=attrs.get("username", ""),
        )
        validate_password(attrs["password"], user=candidate)
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    role = serializers.ChoiceField(choices=User.Role.choices)
    remember_me = serializers.BooleanField(default=False)
