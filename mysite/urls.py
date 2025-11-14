from django.contrib import admin
from django.urls import path, include
from django.contrib.auth.views import LoginView, LogoutView
from core import views

urlpatterns = [
    path('login/', LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('admin/', admin.site.urls),

    # Product manager API routes
    path('', include('product_manager_api.urls')),
    path('', LoginView.as_view(template_name='login.html'), name='home'),
    path('', views.home, name='home'),
]