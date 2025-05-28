from django.contrib import admin

# Register your models here.
from allauth.socialaccount.models import SocialAccount
from .models import Tag, Prompt, PromptVote

# Override __str__ to force string evaluation
SocialAccount.__str__ = lambda self: str(super(SocialAccount, self).__str__())

admin.site.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_predefined')
    list_filter = ('is_predefined',)
    search_fields = ('name',)
    ordering = ('name',)
admin.site.register(Prompt)
admin.site.register(PromptVote)