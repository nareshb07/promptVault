# promptVault-backend/prompts/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User # Assuming this is used for UserSerializer
from .models import Prompt, Tag,PromptVote # Make sure Vote is imported if needed elsewhere
import logging

logger = logging.getLogger(__name__) 
class TagSerializer(serializers.ModelSerializer): # This is already good
    class Meta:
        model = Tag
        fields = ['id', 'name']

class PromptSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    tags = TagSerializer(many=True, read_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=100),
        write_only=True,
        required=False
    )
    score = serializers.SerializerMethodField(read_only=True)
    user_vote = serializers.SerializerMethodField(read_only=True)  # ← NEW FIELD

    class Meta:
        model = Prompt
        fields = [
            'id',
            'user',
            'user_username',
            'title',
            'prompt_text',
            'tags',
            'tag_names',
            'is_public',
            'created_at',
            'updated_at',
            'score',
            'upvotes',
            'downvotes',
            'user_vote',  # ← ADD TO FIELDS
        ]
        read_only_fields = ['user', 'user_username', 'created_at', 'updated_at']
    
    def get_score(self, obj):
        # Use a simple net score for now; can expand later
        return obj.upvotes - obj.downvotes
    



    
    def get_user_vote(self, obj):
        return getattr(obj, 'user_vote', None)



    def _handle_tags(self, prompt_instance, tag_names_data):
        """
        Helper method to get or create tags by name and associate them with the prompt.
        """
        if tag_names_data is not None: # Check if tag_names was provided in the request
            tags_for_prompt = []
            for tag_name in tag_names_data:
                tag_name_cleaned = tag_name.strip().lower() # Normalize tag name
                if tag_name_cleaned: # Ensure not an empty string
                    tag, created = Tag.objects.get_or_create(name=tag_name_cleaned)
                    tags_for_prompt.append(tag)
            prompt_instance.tags.set(tags_for_prompt) # Efficiently sets the M2M relationship
        elif self.partial: # If it's a PATCH request and 'tag_names' is not in the request, don't modify existing tags
            pass
        else: # If it's a POST/PUT and 'tag_names' is not provided (or is empty), clear all tags.
              # You might want to change this behavior if an empty list means "don't touch tags".
              # For now, an empty list or not providing 'tag_names' on PUT will clear tags.
            prompt_instance.tags.clear()


    def create(self, validated_data):
        # Pop 'tag_names' before creating the Prompt instance, as it's not a direct model field
        tag_names_data = validated_data.pop('tag_names', []) # Default to empty list if not provided

        # Set the author to the current user
        validated_data['user'] = self.context['request'].user
        
        prompt_instance = Prompt.objects.create(**validated_data)
        
        # Handle tags after the prompt is created
        self._handle_tags(prompt_instance, tag_names_data)
        
        return prompt_instance

    def update(self, instance, validated_data):
        # Pop 'tag_names'. If not provided in a PATCH, it will be None.
        tag_names_data = validated_data.pop('tag_names', None)

        # Update other fields on the instance
        instance.title = validated_data.get('title', instance.title)
        instance.prompt_text = validated_data.get('prompt_text', instance.prompt_text)
        instance.is_public = validated_data.get('is_public', instance.is_public)
        # Add any other fields from your Prompt model that should be updatable
        
        instance.save() # Save the Prompt instance first

        # Handle tags after the prompt is saved
        # Pass None if tag_names_data wasn't in the request (for PATCH behavior)
        self._handle_tags(instance, tag_names_data)

        return instance

# Your UserSerializer can remain as is
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']




# catching 

    # from django.core.cache import cache

    # def get_user_vote(self, obj):
    #     request = self.context.get('request')
    #     if not request or not request.user.is_authenticated:
    #         return None

    #     cache_key = f"user_vote:{request.user.id}:{obj.id}"
    #     cached_vote = cache.get(cache_key)
        
    #     if cached_vote is not None:
    #         return cached_vote

    #     vote = obj.votes.filter(user=request.user).first()
    #     if vote:
    #         cache.set(cache_key, vote.vote_type, timeout=60*10)  # Cache for 10 mins
    #         return vote.vote_type
        
    #     cache.set(cache_key, None, timeout=60*10)
    #     return None