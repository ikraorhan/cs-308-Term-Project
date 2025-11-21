from django.contrib import admin
from django.urls import path, include
from django.contrib.auth.views import LoginView, LogoutView
from core import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication API routes
    path('api/', include('api.urls')),
    
    # Product manager API routes
    path('', include('product_manager_api.urls')),
    
    # Legacy login/logout (for Django templates)
    path('login/', LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('', LoginView.as_view(template_name='login.html'), name='home'),
]