from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.list_conversations, name='list_conversations'),
    path('conversations/create/', views.create_conversation, name='create_conversation'),
    path('conversations/<int:conversation_id>/', views.get_conversation, name='get_conversation'),
    path('conversations/<int:conversation_id>/claim/', views.claim_conversation, name='claim_conversation'),
    path('conversations/<int:conversation_id>/close/', views.close_conversation, name='close_conversation'),
    path('conversations/<int:conversation_id>/update/', views.update_conversation, name='update_conversation'),
    path('conversations/<int:conversation_id>/customer-details/', views.get_customer_details, name='customer_details'),
    path('upload/', views.upload_file, name='upload_file'),
    path('canned-responses/', views.canned_responses, name='canned_responses'),
    path('canned-responses/<int:response_id>/', views.canned_response_detail, name='canned_response_detail'),
    path('canned-responses/<int:response_id>/use/', views.use_canned_response, name='use_canned_response'),
]

