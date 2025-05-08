from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PromptViewSet, TagViewSet, current_user_api

router = DefaultRouter()
router.register(r'prompts', PromptViewSet, basename='prompt')
router.register(r'tags', TagViewSet, basename='tag')

urlpatterns = [
    path('', include(router.urls)),
    path('user/me/', current_user_api, name='current-user'),
]