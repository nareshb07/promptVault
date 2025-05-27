from django.db import models
from django.contrib.auth.models import User # Using Django's built-in User

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    is_predefined = models.BooleanField(default=False)

    # is_predefined = models.BooleanField(default=False) # We can add this later in Phase 2

    def __str__(self):
        return self.name

class Prompt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='prompts')
    title = models.CharField(max_length=200)
    prompt_text = models.TextField()
    tags = models.ManyToManyField(Tag, related_name='prompts', blank=True)
    is_public = models.BooleanField(default=False) # All private for now
    upvotes = models.PositiveIntegerField(default=0)
    downvotes = models.PositiveIntegerField(default=0)
     # Track origin of copied prompts
    copied_from = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='copies'
    )
    
    # copied_from = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='copies') # Add later
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at'] # Default ordering



class PromptVote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    prompt = models.ForeignKey(Prompt, on_delete=models.CASCADE)
    VOTE_TYPES = [('up', 'Upvote'), ('down', 'Downvote')]
    vote_type = models.CharField(max_length=4, choices=VOTE_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'prompt')

    def __str__(self):
        return f"{self.user} {self.vote_type}d {self.prompt.title}"