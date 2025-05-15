# promptVault-backend/prompts/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User # Assuming this is used for UserSerializer
from .models import Prompt, Tag # Make sure Vote is imported if needed elsewhere

class TagSerializer(serializers.ModelSerializer): # This is already good
    class Meta:
        model = Tag
        fields = ['id', 'name']

class PromptSerializer(serializers.ModelSerializer):
    author_username = serializers.ReadOnlyField(source='author.username') # Good for display

    # This field is for GET requests (reading associated tags)
    tags = TagSerializer(many=True, read_only=True)

    # This new field is for POST/PUT requests (writing/setting tags by name)
    # The frontend will send a list of strings here, e.g., ["coding", "python", "new tag"]
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=100), # Each item in the list is a string
        write_only=True, # This field is only for input, not for output
        required=False   # Makes sending tags optional
    )
    score = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Prompt
        fields = [
            'id',
            'author',         # Keep this for internal linking if needed, but hide from direct write
            'author_username',
            'title',
            'prompt_text',
            'tags',           # For reading tags
            'tag_names',      # For writing tags by name
            'is_public',
            'created_at',
            'updated_at',
            'score',
            'upvotes',     # ✅ Add this
            'downvotes',
            
            # Add 'upvotes_count', 'downvotes_count', 'copied_from' if they are in your model
        ]
        read_only_fields = ['author', 'author_username', 'created_at', 'updated_at'] # 'author' set in create/update
    
    
    def get_score(self, obj):
        # Use a simple net score for now; can expand later
        return obj.upvotes - obj.downvotes


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
        validated_data['author'] = self.context['request'].user
        
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