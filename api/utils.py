"""
Utility functions for the API
"""
from django.conf import settings


def create_sales_email_html(subject, message, user_name="Customer"):
    """
    Create a professional HTML email template for sales/promotional emails.
    
    Args:
        subject: Email subject line
        message: Plain text message content
        user_name: Name of the recipient for personalization
    
    Returns:
        str: HTML formatted email content
    """
    # Convert plain text message to HTML (preserve line breaks)
    html_message = message.replace('\n', '<br>')
    
    # Get frontend URL from settings
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{subject}</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }}
            .email-container {{
                background-color: #ffffff;
                border-radius: 10px;
                padding: 30px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }}
            .header {{
                text-align: center;
                border-bottom: 3px solid #4CAF50;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }}
            .header h1 {{
                color: #4CAF50;
                margin: 0;
                font-size: 28px;
            }}
            .paw-icon {{
                font-size: 32px;
                margin-bottom: 10px;
            }}
            .greeting {{
                font-size: 18px;
                color: #555;
                margin-bottom: 20px;
            }}
            .message-content {{
                font-size: 16px;
                color: #333;
                margin: 20px 0;
                padding: 20px;
                background-color: #f9f9f9;
                border-left: 4px solid #4CAF50;
                border-radius: 5px;
            }}
            .cta-button {{
                display: inline-block;
                padding: 15px 30px;
                background-color: #4CAF50;
                color: #ffffff !important;
                text-decoration: none !important;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
                text-align: center;
                transition: background-color 0.3s ease;
            }}
            .cta-button:hover {{
                background-color: #45a049;
            }}
            .footer {{
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                text-align: center;
                font-size: 12px;
                color: #888;
            }}
            .footer a {{
                color: #4CAF50;
                text-decoration: none;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="paw-icon">🐾</div>
                <h1>Pet Store</h1>
            </div>
            
            <div class="greeting">
                Hello {user_name},
            </div>
            
            <div class="message-content">
                {html_message}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{frontend_url}/products" class="cta-button" style="color: #ffffff !important; text-decoration: none !important; display: inline-block; padding: 15px 30px; background-color: #4CAF50; border-radius: 5px; font-weight: bold;">🛒 Shop Now</a>
            </div>
            
            <div class="footer">
                <p>Thank you for being a valued customer!</p>
                <p>
                    You're receiving this email because you subscribed to our sales notifications.
                    <br>
                    <a href="{frontend_url}/profile">Unsubscribe</a> | <a href="{frontend_url}/profile">Update Preferences</a>
                </p>
                <p>&copy; 2024 Pet Store. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html_content

