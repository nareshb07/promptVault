# accounts/signals.py
from allauth.account.signals import user_signed_up
from django.dispatch import receiver

@receiver(user_signed_up)
def set_username_from_email(request, user, **kwargs):
    if not user.username and user.email:
        user.username = user.email.split('@')[0]
        user.save()
