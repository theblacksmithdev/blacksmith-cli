from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from drf_spectacular.utils import extend_schema

from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
    TokenSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)


class AuthViewSet(ViewSet):
    """Authentication endpoints for the application."""

    @extend_schema(
        request=LoginSerializer,
        responses={200: TokenSerializer},
        description='Authenticate with email and password. Returns JWT access and refresh tokens.',
        tags=['auth'],
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

    @extend_schema(
        request=RegisterSerializer,
        responses={201: TokenSerializer},
        description='Create a new user account. Returns JWT tokens.',
        tags=['auth'],
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        request=None,
        responses={200: UserSerializer},
        description='Get or update the current authenticated user profile.',
        tags=['auth'],
    )
    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            serializer = UserSerializer(request.user)
            return Response(serializer.data)

        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @extend_schema(
        request=ChangePasswordSerializer,
        responses={200: None},
        description='Change the current user password.',
        tags=['auth'],
    )
    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticated],
        url_path='change-password',
    )
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'detail': 'Password changed successfully.'})

    @extend_schema(
        request=ForgotPasswordSerializer,
        responses={200: None},
        description='Request a password reset email.',
        tags=['auth'],
    )
    @action(
        detail=False,
        methods=['post'],
        permission_classes=[AllowAny],
        url_path='forgot-password',
    )
    def forgot_password(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # TODO: Implement email sending logic
        # Always return success to prevent email enumeration
        return Response({'detail': 'If an account exists, a reset email has been sent.'})

    @extend_schema(
        request=ResetPasswordSerializer,
        responses={200: None},
        description='Reset password using a token from the reset email.',
        tags=['auth'],
    )
    @action(
        detail=False,
        methods=['post'],
        permission_classes=[AllowAny],
        url_path='reset-password',
    )
    def reset_password(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # TODO: Implement token verification and password reset
        return Response({'detail': 'Password has been reset successfully.'})

    @extend_schema(
        request=None,
        responses={200: None},
        description='Logout by blacklisting the refresh token.',
        tags=['auth'],
    )
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except TokenError:
            pass
        return Response({'detail': 'Successfully logged out.'})

    @extend_schema(
        request=None,
        responses={200: TokenSerializer},
        description='Refresh the access token using a valid refresh token.',
        tags=['auth'],
    )
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def refresh(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'detail': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            return Response({
                'access': str(token.access_token),
                'refresh': str(token),
            })
        except TokenError:
            return Response(
                {'detail': 'Invalid or expired refresh token.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
