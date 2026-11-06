from django.conf import settings
from django.contrib.auth import get_user_model
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer, RegisterSerializer
from .services import authenticate_user, generate_token_pair

User = get_user_model()
COOKIE_NAME = settings.AUTH_COOKIE_NAME


def set_refresh_cookie(response, token, remember_me):
    options = {
        "httponly": True,
        "secure": settings.AUTH_COOKIE_SECURE,
        "samesite": settings.AUTH_COOKIE_SAMESITE,
        "path": settings.AUTH_COOKIE_PATH,
    }
    if remember_me:
        options["max_age"] = int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds())
    response.set_cookie(COOKIE_NAME, token, **options)


def clear_refresh_cookie(response):
    response.delete_cookie(
        COOKIE_NAME,
        path=settings.AUTH_COOKIE_PATH,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )


class AuthThrottle(AnonRateThrottle):
    scope = "auth"


class CsrfView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return Response({"csrfToken": get_token(request)})


class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [AuthThrottle]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                "message": "Registration successful.",
                "user": {
                    "id": user.pk,
                    "email": user.email,
                    "username": user.username,
                    "role": user.role,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [AuthThrottle]

    @method_decorator(csrf_protect)
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = authenticate_user(request, data["email"], data["password"])

        # Do not disclose whether the email or password was incorrect.
        if user is None:
            return Response(
                {"message": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"message": "This account is inactive."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if user.role != data["role"]:
            return Response(
                {"message": "The selected role does not match this account."},
                status=status.HTTP_403_FORBIDDEN,
            )

        tokens = generate_token_pair(user, data["remember_me"])
        response = Response(
            {
                "message": "Login successful.",
                "access": tokens["access"],
                "user": {
                    "id": user.pk,
                    "email": user.email,
                    "username": user.username,
                    "role": user.role,
                },
                "csrfToken": get_token(request),
            },
            status=status.HTTP_200_OK,
        )
        set_refresh_cookie(response, tokens["refresh"], data["remember_me"])
        return response


class RefreshView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [AuthThrottle]

    @method_decorator(csrf_protect)
    def post(self, request):
        raw_token = request.COOKIES.get(COOKIE_NAME)
        if not raw_token:
            return Response(
                {"message": "Refresh token not found."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            old_refresh = RefreshToken(raw_token)
            user_id = old_refresh["user_id"]
            remember_me = bool(old_refresh.get("remember_me", False))
            user = User.objects.get(pk=user_id, is_active=True)

            # Revoke the presented token before issuing a replacement.
            old_refresh.blacklist()
            tokens = generate_token_pair(user, remember_me)

            response = Response(
                {"access": tokens["access"], "message": "Token refreshed."},
                status=status.HTTP_200_OK,
            )
            set_refresh_cookie(response, tokens["refresh"], remember_me)
            return response

        except (TokenError, User.DoesNotExist, KeyError, TypeError, ValueError):
            response = Response(
                {"message": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            clear_refresh_cookie(response)
            return response


class LogoutView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @method_decorator(csrf_protect)
    def post(self, request):
        raw_token = request.COOKIES.get(COOKIE_NAME)
        if raw_token:
            try:
                RefreshToken(raw_token).blacklist()
            except TokenError:
                pass

        response = Response(
            {"message": "Logged out successfully."},
            status=status.HTTP_200_OK,
        )
        clear_refresh_cookie(response)
        return response


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "id": user.pk,
                "email": user.email,
                "username": user.username,
                "role": user.role,
            }
        )
