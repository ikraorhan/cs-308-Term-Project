# Sales Email Automation

This document explains how to use the sales email automation system for sending promotional emails to subscribed users.

## Features

- Users can opt-in/opt-out of receiving sales emails through their profile settings
- Management command to send bulk sales emails to all subscribed users
- HTML email templates with professional styling
- Personalization with user names
- Dry-run mode for testing
- Error handling and reporting

## User Profile Settings

Users can manage their sales email subscription through the API:

### Get User Profile
```bash
GET /api/user/
```
The response includes `receive_sales_emails` in the profile object.

### Update Subscription Preference
```bash
PUT /api/user/profile/
Content-Type: application/json

{
  "receive_sales_emails": true  // or false to unsubscribe
}
```

## Sending Sales Emails

### Basic Usage

Send a sales email to all subscribed users:

```bash
python manage.py send_sales_emails \
  --subject "Special Sale - 50% Off!" \
  --message "Don't miss our amazing sale! Get 50% off on all products this weekend. Shop now!"
```

### With HTML Message

You can provide a custom HTML message:

```bash
python manage.py send_sales_emails \
  --subject "New Arrivals" \
  --message "Check out our new products!" \
  --html-message "<h1>New Products!</h1><p>We have amazing new products for your pets!</p>"
```

### Dry Run (Testing)

Test the command without actually sending emails:

```bash
python manage.py send_sales_emails \
  --subject "Test Email" \
  --message "This is a test" \
  --dry-run
```

### Limit Number of Emails (Testing)

Send to only a limited number of users for testing:

```bash
python manage.py send_sales_emails \
  --subject "Test Email" \
  --message "This is a test" \
  --limit 5
```

## Command Options

- `--subject` (required): Email subject line
- `--message` (required): Plain text email message
- `--html-message` (optional): Custom HTML version of the email
- `--dry-run`: Test mode - shows who would receive emails without sending
- `--limit`: Limit the number of emails to send (useful for testing)

## Email Template

The system automatically creates a professional HTML email template with:
- Pet Shop branding with paw icons
- Responsive design
- "Shop Now" button linking to products page
- Unsubscribe information in footer

If you don't provide `--html-message`, the system uses the default template from `api/utils.py`.

## Example Workflow

1. **User subscribes**: User goes to profile settings and enables "Receive sales emails"
2. **Admin sends email**: Admin runs the management command with sale details
3. **Users receive email**: All subscribed users receive the promotional email

## Database

The subscription preference is stored in the `UserProfile` model:
- Field: `receive_sales_emails` (BooleanField, default=False)
- Migration: `api/migrations/0004_userprofile_receive_sales_emails.py`

## API Integration

### Frontend Example (React)

```javascript
// Update user's sales email preference
const updateSalesEmailPreference = async (enabled) => {
  const response = await fetch('/api/user/profile/', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      receive_sales_emails: enabled
    })
  });
  return response.json();
};

// Get user profile (includes receive_sales_emails)
const getUserProfile = async () => {
  const response = await fetch('/api/user/', {
    credentials: 'include'
  });
  return response.json();
};
```

## Notes

- Only active users with valid email addresses receive emails
- The command shows a summary of successful and failed sends
- Email sending uses Django's email backend (configured in settings.py)
- The default from email is set in `settings.DEFAULT_FROM_EMAIL`


