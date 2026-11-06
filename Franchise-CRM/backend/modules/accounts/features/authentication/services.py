from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


def authenticate_user(request, email, password):
    return authenticate(request=request, email=email, password=password)


def generate_token_pair(user, remember_me=False):
    refresh = RefreshToken.for_user(user)
    refresh["role"] = user.role
    refresh["remember_me"] = bool(remember_me)

    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }
