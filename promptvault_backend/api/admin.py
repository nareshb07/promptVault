from django.contrib import admin

# Register your models here.
from allauth.socialaccount.models import SocialAccount
from .models import Tag, Prompt

# Override __str__ to force string evaluation
SocialAccount.__str__ = lambda self: str(super(SocialAccount, self).__str__())

admin.site.register(Tag)
admin.site.register(Prompt)
