from django.db import models
from django.contrib.auth.models import User


class SupportAgent(models.Model):
    """Support agent profile - links to User"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='support_agent_profile')
    is_available = models.BooleanField(default=True)
    active_conversations_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Support Agent: {self.user.username}"

    class Meta:
        verbose_name = "Support Agent"
        verbose_name_plural = "Support Agents"


class Conversation(models.Model):
    """Customer support conversation"""
    STATUS_CHOICES = [
        ('waiting', 'Waiting for Agent'),
        ('active', 'Active'),
        ('closed', 'Closed'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    customer = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='customer_conversations',
        help_text="Null for guest users"
    )
    agent = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='agent_conversations',
        help_text="Assigned support agent"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting', db_index=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium', db_index=True)
    tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags")
    internal_notes = models.TextField(blank=True, help_text="Internal notes visible only to agents")
    guest_session_id = models.CharField(
        max_length=255, 
        null=True, 
        blank=True,
        help_text="Session ID for guest users"
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        if self.customer:
            customer_name = self.customer.username
        elif self.guest_session_id:
            customer_name = f"Guest ({self.guest_session_id[:8]})"
        else:
            customer_name = "Guest (Unknown)"
        return f"Conversation #{self.id} - {customer_name} ({self.status})"

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['agent', 'status']),
        ]


class Message(models.Model):
    """Messages in a conversation"""
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('file', 'File'),
    ]

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_messages')
    is_from_agent = models.BooleanField(default=False, db_index=True)
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    content = models.TextField(blank=True, help_text="Text content or file description")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        if self.sender:
            sender_name = self.sender.username
        else:
            sender_name = "Guest"
        return f"Message from {sender_name} in Conversation #{self.conversation.id}"

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
        ]


class Attachment(models.Model):
    """File attachments for messages"""
    FILE_TYPES = [
        ('pdf', 'PDF'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('other', 'Other'),
    ]

    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='support_attachments/%Y/%m/%d/')
    file_type = models.CharField(max_length=10, choices=FILE_TYPES)
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField(help_text="File size in bytes")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file_name} ({self.file_type})"

    class Meta:
        ordering = ['-uploaded_at']


class CannedResponse(models.Model):
    """Pre-defined response templates for support agents"""
    title = models.CharField(max_length=200, help_text="Short title for the response")
    content = models.TextField(help_text="Response content")
    category = models.CharField(max_length=50, blank=True, help_text="Category (e.g., 'Order', 'Refund', 'Technical')")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='canned_responses')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    usage_count = models.IntegerField(default=0, help_text="Number of times this response has been used")

    def __str__(self):
        return f"{self.title} ({self.category})"

    class Meta:
        ordering = ['-usage_count', 'title']
        verbose_name = "Canned Response"
        verbose_name_plural = "Canned Responses"
