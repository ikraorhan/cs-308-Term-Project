from django.urls import path
from . import views

urlpatterns = [
    path('dashboard-stats/', views.dashboard_stats, name='dashboard-stats'),
    path('campaigns/', views.campaign_list_create, name='campaign-list-create'),
    path('campaigns/<int:pk>/', views.campaign_detail, name='campaign-detail'),
    path('products/<int:product_id>/price/', views.update_product_price, name='update-product-price'),
]
