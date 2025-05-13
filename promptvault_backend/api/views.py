from rest_framework import viewsets, permissions, generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import F, ExpressionWrapper, fields, Count, Exists, OuterRef
from django.db.models.functions import Now, Extract
from django.utils.timezone import now
from datetime import timedelta
import math
import logging

from .models import Prompt, Tag
from .serializers import PromptSerializer, TagSerializer, UserSerializer

# ======================
# Setup Logging
# ======================

logger = logging.getLogger(__name__)  # ✅ Added: For debugging and tracking

# ======================
# Basic Views & Permissions
# ======================

def home(request):
    return HttpResponse("Welcome to the Home Page!")

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100

# ======================
# Prompt ViewSet
# ======================

class PromptViewSet(viewsets.ModelViewSet):
    serializer_class = PromptSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = Prompt.objects.all()

        if self.request.user.is_authenticated:
            if 'list' in str(self.action):
                is_public = self.request.query_params.get('is_public')
                if is_public is not None:
                    queryset = queryset.filter(is_public=(is_public.lower() == 'true'))
                else:
                    if not self.request.user.is_superuser:
                        queryset = queryset.filter(author=self.request.user)
        else:
            queryset = queryset.filter(is_public=True)

        queryset = queryset.annotate(
            score=F('upvotes') - F('downvotes')
        )

        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

# ======================
# Tag ViewSet
# ======================

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all().order_by('name')
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        name = self.request.data.get('name', '').strip().lower()
        if Tag.objects.filter(name=name).exists():
            raise serializers.ValidationError({'name': 'Tag already exists'})
        serializer.save(name=name)

# ======================
# User Info API
# ======================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user_api(request):
    serializer = UserSerializer(request.user)
    logger.info("Current user requested by %s", request.user.username)  # ✅ Logging added
    return Response(serializer.data)

# ======================
# Trending Prompts
# ======================

class TrendingPromptsPagination(StandardResultsSetPagination):
    page_size = 5
    page_size_query_param = 'page_size'

# from django.db.models.functions import ExtractHour, ExtractEpoch
# from django.db.models import F, ExpressionWrapper, FloatField
from datetime import datetime

@api_view(['GET'])
@permission_classes([AllowAny])
def trending_prompts(request):
    """
    GET /api/prompts/trending/
    Returns public prompts sorted by trending score: (upvotes - downvotes) / log(hours_old + 2)
    Optional query params:
      - ?tag=ai
      - ?page=1
    """
    logger.info("Fetching trending prompts...")  # ✅ Logging

    try:
        tag_name = request.query_params.get('tag', None)

        # 🔍 Optional tag filtering
        queryset = Prompt.objects.filter(is_public=True)
        if tag_name:
            queryset = queryset.filter(tags__name__iexact=tag_name)

        # Annotate with score and age
        # queryset = queryset.annotate(
        #     score=F('upvotes') - F('downvotes'),
        #     age_delta=ExpressionWrapper(
        #         Now() - F('created_at'), output_field=fields.DurationField()
        #         ),
        # ).annotate(
        #     hours_old=ExpressionWrapper(
        #         Extract('age_delta', 'epoch') / 3600,
        #         output_field=fields.FloatField()
        #     )
        # ).

        queryset = queryset.annotate(
            score=F('upvotes') - F('downvotes'),
            hours_old= (datetime.now() - queryset.created_at).total_seconds() / 3600
        )

        prompts = list(queryset)

        def calculate_trending_score(prompt):
            """Score = (upvotes - downvotes) / log(age_in_hours + 2)"""
            try:
                hours_old = prompt.hours_old or (now() - prompt.created_at).total_seconds() / 3600
            except:
                hours_old = (now() - prompt.created_at).total_seconds() / 3600

            decay = math.log(hours_old + 2)
            return prompt.score / decay if decay > 0 else prompt.score

        # Sort manually based on trending score
        prompts.sort(key=calculate_trending_score, reverse=True)

        # ✅ Add pagination
        paginator = TrendingPromptsPagination()
        page = paginator.paginate_queryset(prompts, request)

        serializer = PromptSerializer(page, many=True, context={'request': request})
        logger.info(f"Returning {len(serializer.data)} trending prompts")
        return paginator.get_paginated_response(serializer.data)

    except Exception as e:
        logger.error("Error fetching trending prompts: %s", str(e))
        return Response({"error": "Failed to fetch trending prompts", "details": str(e)}, status=500)
    
# views.py

from .models import PromptVote

# without Cache

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upvote_prompt(request, pk):
    user = request.user
    try:
        prompt = Prompt.objects.get(pk=pk, is_public=True)

        existing_vote = PromptVote.objects.filter(user=user, prompt=prompt).first()
        if existing_vote:
            if existing_vote.vote_type == 'up':
                return Response({'status': 'already_upvoted'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                prompt.downvotes -= 1
                prompt.upvotes += 1
                prompt.save(update_fields=['upvotes', 'downvotes'])
                existing_vote.vote_type = 'up'
                existing_vote.save()
        else:
            prompt.upvotes += 1
            prompt.save(update_fields=['upvotes'])
            PromptVote.objects.create(user=user, prompt=prompt, vote_type='up')

        return Response({'id': prompt.id, 'score': prompt.upvotes - prompt.downvotes})

    except Prompt.DoesNotExist:
        logger.warning("Prompt not found for upvote: %s", pk)
        return Response({'error': 'Prompt not found'}, status=status.HTTP_404_NOT_FOUND)
    
# from django.core.cache import cache
# def trending_prompts(request):
#     """
#     GET /api/prompts/trending/
#     Returns public prompts sorted by trending score: (upvotes - downvotes) / log(hours_old + 2)
#     Optional query params: ?tag=ai | ?page=1
#     """
#     logger.info("Fetching trending prompts...")

#     # 🔥 Cache key based on tag
#     tag_name = request.query_params.get('tag', 'all')
#     cache_key = f'trending_prompts_{tag_name}'
#     cached = cache.get(cache_key)

#     if cached:
#         logger.debug("Serving from cache")
#         return Response(cached)

#     try:
#         queryset = Prompt.objects.filter(is_public=True)
#         if tag_name != 'all':
#             queryset = queryset.filter(tags__name__iexact=tag_name)

#         # Annotate time and score
#         queryset = queryset.annotate(
#             score=F('upvotes') - F('downvotes'),
#             age_delta=ExpressionWrapper(Now() - F('created_at'), output_field=fields.DurationField())
#         ).annotate(
#             hours_old=ExpressionWrapper(
#                 Extract('age_delta', 'epoch') / 3600,
#                 output_field=fields.FloatField()
#             )
#         )

#         prompts = list(queryset)

#         def calculate_trending_score(prompt):
#             try:
#                 hours_old = prompt.hours_old or (now() - prompt.created_at).total_seconds() / 3600
#             except:
#                 hours_old = (now() - prompt.created_at).total_seconds() / 3600

#             decay = math.log(hours_old + 2)
#             return prompt.score / decay if decay > 0 else prompt.score

#         prompts.sort(key=calculate_trending_score, reverse=True)

#         # Serialize
#         paginator = TrendingPromptsPagination()
#         page = paginator.paginate_queryset(prompts, request)
#         serializer = PromptSerializer(page, many=True, context={'request': request})
#         response_data = paginator.get_paginated_response(serializer.data).data

#         # Store in cache for 5 minutes
#         cache.set(cache_key, response_data, timeout=300)

#         logger.info("Trending prompts fetched and cached.")
#         return Response(response_data)

#     except Exception as e:
#         logger.error("Error fetching trending prompts: %s", str(e))
#         return Response({"error": "Failed to fetch trending prompts"}, status=500)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upvote_prompt(request, pk):
    user = request.user
    try:
        prompt = Prompt.objects.get(pk=pk, is_public=True)

        existing_vote = PromptVote.objects.filter(user=user, prompt=prompt).first()
        if existing_vote:
            if existing_vote.vote_type == 'up':
                return Response({'status': 'already_upvoted'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                prompt.downvotes -= 1
                prompt.upvotes += 1
                prompt.save(update_fields=['upvotes', 'downvotes'])
                existing_vote.vote_type = 'up'
                existing_vote.save()
        else:
            prompt.upvotes += 1
            prompt.save(update_fields=['upvotes'])
            PromptVote.objects.create(user=user, prompt=prompt, vote_type='up')

        return Response({'id': prompt.id, 'score': prompt.upvotes - prompt.downvotes})

    except Prompt.DoesNotExist:
        logger.warning("Prompt not found for upvote: %s", pk)
        return Response({'error': 'Prompt not found'}, status=status.HTTP_404_NOT_FOUND)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def downvote_prompt(request, pk):
    user = request.user
    try:
        prompt = Prompt.objects.get(pk=pk, is_public=True)

        existing_vote = PromptVote.objects.filter(user=user, prompt=prompt).first()
        if existing_vote:
            if existing_vote.vote_type == 'down':
                return Response({'status': 'already_downvoted'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                prompt.upvotes -= 1
                prompt.downvotes += 1
                prompt.save(update_fields=['upvotes', 'downvotes'])
                existing_vote.vote_type = 'down'
                existing_vote.save()
        else:
            prompt.downvotes += 1
            prompt.save(update_fields=['downvotes'])
            PromptVote.objects.create(user=user, prompt=prompt, vote_type='down')

        return Response({'id': prompt.id, 'score': prompt.upvotes - prompt.downvotes})

    except Prompt.DoesNotExist:
        logger.warning("Prompt not found for downvote: %s", pk)
        return Response({'error': 'Prompt not found'}, status=status.HTTP_404_NOT_FOUND)