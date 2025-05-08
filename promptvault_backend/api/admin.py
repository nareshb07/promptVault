from django.contrib import admin

# Register your models here.
from allauth.socialaccount.models import SocialAccount

# Override __str__ to force string evaluation
SocialAccount.__str__ = lambda self: str(super(SocialAccount, self).__str__())
