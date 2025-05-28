from django.contrib import admin
from django.urls import path, include
from api.views import home

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')), # From previous step
    path('api/', include('api.urls')), 
    path('', home)       # Add this line for your API app
]