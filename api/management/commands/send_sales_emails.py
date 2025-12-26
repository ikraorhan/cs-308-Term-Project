"""
Management command to send sales/promotional emails to users who have opted in.

Usage:
    python manage.py send_sales_emails --subject "Special Sale!" --message "Get 50% off on all products!"
    python manage.py send_sales_emails --subject "New Arrivals" --message "Check out our new products!" --html-template
"""

from django.core.management.base import BaseCommand, CommandError
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth.models import User
from django.conf import settings
from api.models import UserProfile
from api.utils import create_sales_email_html
from django.utils import timezone
import sys


class Command(BaseCommand):
    help = 'Send sales/promotional emails to users who have opted in to receive them'

    def add_arguments(self, parser):
        parser.add_argument(
            '--subject',
            type=str,
            required=True,
            help='Email subject line',
        )
        parser.add_argument(
            '--message',
            type=str,
            required=True,
            help='Email message body (plain text)',
        )
        parser.add_argument(
            '--html-message',
            type=str,
            default=None,
            help='Optional HTML version of the email message',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Test run without actually sending emails',
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Limit the number of emails to send (useful for testing)',
        )

    def handle(self, *args, **options):
        subject = options['subject']
        message = options['message']
        html_message = options.get('html_message')
        dry_run = options.get('dry_run', False)
        limit = options.get('limit')

        # Get all users who want to receive sales emails
        users_with_preference = User.objects.filter(
            profile__receive_sales_emails=True,
            is_active=True
        ).select_related('profile')

        # Filter users with valid email addresses
        users_to_email = [
            user for user in users_with_preference
            if user.email and user.email.strip()
        ]

        total_users = len(users_to_email)
        
        if limit:
            users_to_email = users_to_email[:limit]
            self.stdout.write(
                self.style.WARNING(
                    f'Limited to {limit} users (out of {total_users} total subscribers)'
                )
            )

        if not users_to_email:
            self.stdout.write(
                self.style.WARNING('No users found who want to receive sales emails.')
            )
            return

        self.stdout.write(
            self.style.SUCCESS(
                f'Found {len(users_to_email)} user(s) to email (out of {total_users} total subscribers)'
            )
        )

        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - No emails will be sent')
            )
            for user in users_to_email:
                self.stdout.write(f'  - Would send to: {user.email} ({user.username})')
            return

        # Send emails
        success_count = 0
        error_count = 0
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@petstore.com')

        for user in users_to_email:
            try:
                # Get user's name for personalization
                user_name = user.get_full_name() or user.first_name or user.username
                
                # Create HTML version if not provided
                if not html_message:
                    html_message = create_sales_email_html(subject, message, user_name)
                
                # Create email
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=message,
                    from_email=from_email,
                    to=[user.email],
                )

                # Add HTML version
                email.attach_alternative(html_message, "text/html")

                # Send email
                email.send(fail_silently=False)
                success_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Sent to {user.email} ({user.username})')
                )

            except Exception as e:
                error_count += 1
                self.stdout.write(
                    self.style.ERROR(
                        f'✗ Failed to send to {user.email} ({user.username}): {str(e)}'
                    )
                )

        # Summary
        self.stdout.write('')
        self.stdout.write(
            self.style.SUCCESS(
                f'\nEmail sending completed!\n'
                f'  Successfully sent: {success_count}\n'
                f'  Failed: {error_count}\n'
                f'  Total: {len(users_to_email)}'
            )
        )

