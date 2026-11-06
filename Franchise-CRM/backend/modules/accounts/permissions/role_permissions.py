from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    message = "Administrator permissions are required."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and request.user.role == "admin"
        )


class IsUserRole(BasePermission):
    message = "A user account is required."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
            and request.user.role == "user"
        )
