from rest_framework import viewsets, permissions
from .models import Prompt, Tag
from .serializers import PromptSerializer, TagSerializer, UserSerializer
from django.contrib.auth.models import User # Import User
from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to the Home Page!")
class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions are only allowed to the author of the prompt.
        return obj.author == request.user
    

# from django.views.decorators.csrf import csrf_exempt

# @csrf_exempt
class PromptViewSet(viewsets.ModelViewSet):
    serializer_class = PromptSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly] # Require auth, and owner for edit/delete

    def get_queryset(self):
        """
        This view should return a list of all the prompts
        for the currently authenticated user.
        """
        return Prompt.objects.filter(author=self.request.user).order_by('-created_at')

    # perform_create is automatically handled by serializer's create method
    # def perform_create(self, serializer):
    #     serializer.save(author=self.request.user)

class TagViewSet(viewsets.ModelViewSet): # Basic CRUD for tags, can be refined later
    queryset = Tag.objects.all().order_by('name')
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Allow read for anyone, write for auth users

# A simple view to get current user details
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
# from django.views.decorators.csrf import csrf_exempt
# @csrf_exempt  # You may need this temporarily for GET
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user_api(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)