from rest_framework import viewsets, permissions, generics
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.db.models import F, ExpressionWrapper, fields, Count, Exists, OuterRef,Subquery
from django.db.models.functions import Now, Extract
from django.utils.timezone import now
from datetime import timedelta
import math
import logging
from .models import Prompt, Tag, PromptVote
from .serializers import PromptSerializer, TagSerializer, UserSerializer
from datetime import datetime
from .pagination import TrendingPromptsPagination
from django.http import HttpResponse





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
from django.db.models import F, Prefetch
from .models import PromptVote

class PromptViewSet(viewsets.ModelViewSet):
    serializer_class = PromptSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    pagination_class = StandardResultsSetPagination



  # adjust if your vote model is named differently

    def get_queryset(self):
        queryset = Prompt.objects.all()

        # Handle visibility based on authentication and query params
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

        # Annotate score (upvotes - downvotes)
        queryset = queryset.annotate(
            score=F('upvotes') - F('downvotes')
        )

        # Annotate user_vote using Subquery instead of prefetch_related
        if self.request.user.is_authenticated:
            user_vote_subquery = PromptVote.objects.filter(
                prompt=OuterRef('pk'),
                user=self.request.user
            ).values('vote_type')[:1]

            queryset = queryset.annotate(
                user_vote=Subquery(user_vote_subquery)
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

from django.db.models import F
from .models import PromptVote

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
    logger.info("Fetching trending prompts...")
    logger.info("Authenticated: %s", request.user.is_authenticated)
    logger.info("User: %s", request.user)

    try:
        tag_name = request.query_params.get('tag', None)

        # Base queryset
        queryset = Prompt.objects.filter(is_public=True)

        if request.user.is_authenticated:
            queryset = queryset.prefetch_related(
                Prefetch(
                    'promptvote_set',
                    queryset=PromptVote.objects.filter(user=request.user),
                    to_attr='user_votes'
                )
            )
        if tag_name:
            queryset = queryset.filter(tags__name__iexact=tag_name)

        # Annotate with score and age
        queryset = queryset.annotate(
            score=F('upvotes') - F('downvotes'),
            age_delta=ExpressionWrapper(Now() - F('created_at'), output_field=fields.DurationField()),
        ).annotate(
            hours_old=ExpressionWrapper(
                Extract('age_delta', 'epoch') / 3600,
                output_field=fields.FloatField()
            )
        )

        prompts = list(queryset)

        # --- NEW: Attach user vote if authenticated ---
        if request.user.is_authenticated:
            prompt_ids = [p.id for p in prompts]
            user_votes = PromptVote.objects.filter(
                user=request.user,
                prompt_id__in=prompt_ids
            )
            vote_map = {vote.prompt_id: vote.vote_type for vote in user_votes}

            # Attach user_vote to each prompt
            # Attach user_vote (if prefetch was used)
        for prompt in queryset:
            if hasattr(prompt, 'user_votes') and prompt.user_votes:
                prompt.user_vote = prompt.user_votes[0].vote_type
            else:
                prompt.user_vote = None


        # Define scoring function
        def calculate_trending_score(prompt):
            try:
                hours_old = prompt.hours_old or (now() - prompt.created_at).total_seconds() / 3600
            except:
                hours_old = (now() - prompt.created_at).total_seconds() / 3600

            decay = math.log(hours_old + 2)
            return prompt.score / decay if decay > 0 else prompt.score

        # Sort manually based on trending score
        prompts.sort(key=calculate_trending_score, reverse=True)

        # Pagination
        paginator = TrendingPromptsPagination()
        page = paginator.paginate_queryset(prompts, request)

        # Serialize with context
        serializer = PromptSerializer(page, many=True, context={'request': request})
        paginated_data = paginator.get_paginated_response(serializer.data).data

        return Response(paginated_data)

    except Exception as e:
        logger.error("Error fetching trending prompts: %s", str(e))
        return Response({"error": "Failed to fetch trending prompts", "details": str(e)}, status=500)
    
# views.py

from .models import PromptVote



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
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_vote(request, pk):
    user = request.user
    try:
        prompt = Prompt.objects.get(pk=pk, is_public=True)
        
        try:
            vote = PromptVote.objects.get(user=user, prompt=prompt)
            
            # Update prompt vote counts based on the existing vote type
            if vote.vote_type == 'up':
                prompt.upvotes -= 1
            elif vote.vote_type == 'down':
                prompt.downvotes -= 1
            
            prompt.save(update_fields=['upvotes', 'downvotes'])
            vote.delete()
            
            return Response({
                'id': prompt.id,
                'score': prompt.upvotes - prompt.downvotes,
                'upvotes': prompt.upvotes,
                'downvotes': prompt.downvotes,
                'user_vote': None
            })
            
        except PromptVote.DoesNotExist:
            return Response({
                'error': 'No vote exists for this user and prompt'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Prompt.DoesNotExist:
        logger.warning("Prompt not found for remove_vote: %s", pk)
        return Response({'error': 'Prompt not found'}, status=status.HTTP_404_NOT_FOUND)