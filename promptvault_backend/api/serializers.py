from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Prompt, Tag

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class PromptSerializer(serializers.ModelSerializer):
    # Make tags readable in responses, and allow setting by ID or name on write
    tags = TagSerializer(many=True, read_only=True) # For read operations
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Tag.objects.all(), source='tags', write_only=True, required=False
    )
    # To display author's username (read-only)
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = Prompt
        fields = [
            'id', 'author', 'author_username', 'title', 'prompt_text',
            'tags', 'tag_ids', 'is_public', 'created_at', 'updated_at'
        ]
        read_only_fields = ['author'] # Author should be set automatically

    def create(self, validated_data):
        # Set the author to the current user during creation
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class UserSerializer(serializers.ModelSerializer): # For displaying user info
    class Meta:
        model = User
        fields = ['id', 'username', 'email'] # Add more fields if needed