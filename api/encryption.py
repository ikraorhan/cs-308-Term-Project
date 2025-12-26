"""
Encryption utilities for securing sensitive data at rest.
Uses Fernet symmetric encryption (AES-128) for encrypting sensitive fields
like delivery addresses, customer details in invoices, etc.
"""
import os
import base64
from django.conf import settings
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


def get_encryption_key():
    """
    Generate or retrieve the encryption key from settings.
    The key is derived from Django's SECRET_KEY for simplicity.
    In production, use a separate ENCRYPTION_KEY environment variable.
    """
    # Try to get dedicated encryption key first
    encryption_key = getattr(settings, 'ENCRYPTION_KEY', None)
    
    if encryption_key:
        # If a dedicated key is provided, use it
        return encryption_key.encode() if isinstance(encryption_key, str) else encryption_key
    
    # Derive key from SECRET_KEY (less ideal but works for minimal changes)
    secret_key = settings.SECRET_KEY.encode()
    salt = b'petstore_encryption_salt'  # Fixed salt for consistency
    
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    
    key = base64.urlsafe_b64encode(kdf.derive(secret_key))
    return key


def get_fernet():
    """Get Fernet instance for encryption/decryption."""
    return Fernet(get_encryption_key())


def encrypt_data(plaintext):
    """
    Encrypt sensitive data.
    
    Args:
        plaintext: String data to encrypt
        
    Returns:
        Encrypted string (base64 encoded) or None if input is empty
    """
    if not plaintext:
        return plaintext
    
    if isinstance(plaintext, str):
        plaintext = plaintext.encode('utf-8')
    
    fernet = get_fernet()
    encrypted = fernet.encrypt(plaintext)
    return encrypted.decode('utf-8')


def decrypt_data(encrypted_text):
    """
    Decrypt sensitive data.
    
    Args:
        encrypted_text: Encrypted string (base64 encoded)
        
    Returns:
        Decrypted string or original if decryption fails
    """
    if not encrypted_text:
        return encrypted_text
    
    try:
        fernet = get_fernet()
        if isinstance(encrypted_text, str):
            encrypted_text = encrypted_text.encode('utf-8')
        
        decrypted = fernet.decrypt(encrypted_text)
        return decrypted.decode('utf-8')
    except Exception:
        # If decryption fails, return original (might be unencrypted legacy data)
        return encrypted_text if isinstance(encrypted_text, str) else encrypted_text.decode('utf-8')


def mask_sensitive_data(data, visible_chars=4):
    """
    Mask sensitive data for display (e.g., credit card numbers, addresses).
    Shows only last few characters.
    
    Args:
        data: String data to mask
        visible_chars: Number of characters to show at the end
        
    Returns:
        Masked string like "****1234"
    """
    if not data:
        return data
    
    data_str = str(data)
    if len(data_str) <= visible_chars:
        return '*' * len(data_str)
    
    return '*' * (len(data_str) - visible_chars) + data_str[-visible_chars:]


def mask_email(email):
    """
    Mask email address for privacy.
    Shows first 2 chars and domain.
    
    Args:
        email: Email address string
        
    Returns:
        Masked email like "jo****@example.com"
    """
    if not email or '@' not in email:
        return email
    
    local, domain = email.split('@', 1)
    if len(local) <= 2:
        masked_local = '*' * len(local)
    else:
        masked_local = local[:2] + '*' * (len(local) - 2)
    
    return f"{masked_local}@{domain}"


# Custom model field for encrypted data (optional - for future use)
class EncryptedTextField:
    """
    Descriptor for encrypting model fields transparently.
    Usage:
        class MyModel(models.Model):
            _sensitive_data = models.TextField()
            sensitive_data = EncryptedTextField('_sensitive_data')
    """
    def __init__(self, field_name):
        self.field_name = field_name
    
    def __get__(self, obj, type=None):
        if obj is None:
            return self
        encrypted_value = getattr(obj, self.field_name, None)
        return decrypt_data(encrypted_value)
    
    def __set__(self, obj, value):
        encrypted_value = encrypt_data(value)
        setattr(obj, self.field_name, encrypted_value)

