from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PromptViewSet,
    TagViewSet,
    copy_prompt,
    current_user_api,
    remove_vote,
    trending_prompts,
    downvote_prompt,
    upvote_prompt,
)

router = DefaultRouter()
router.register(r'prompts', PromptViewSet, basename='prompt')
router.register(r'tags', TagViewSet, basename='tag')

custom_urlpatterns = [
    path('user/me/', current_user_api, name='current-user'),
    path('prompts/trending/', trending_prompts, name='trending-prompts'),
    path('prompts/<int:pk>/upvote/', upvote_prompt, name='prompt-upvote'),
    path('prompts/<int:pk>/downvote/', downvote_prompt, name='prompt-downvote'),
    path('prompts/<int:pk>/remove_vote/', remove_vote, name='remove-vote'),
    path('prompts/copy/<int:prompt_id>/', copy_prompt, name='copy-prompt'),
]

urlpatterns = [
    *custom_urlpatterns,
    path('', include(router.urls)),
]
