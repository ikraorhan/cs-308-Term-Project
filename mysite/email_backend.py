"""
Custom email backend that disables SSL verification for development
"""
from django.core.mail.backends.smtp import EmailBackend
import ssl

class CustomEmailBackend(EmailBackend):
    def open(self):
        """
        Override to disable SSL certificate verification for development
        """
        if self.connection:
            return False
        
        try:
            self.connection = self.connection_class(
                self.host, self.port, timeout=self.timeout
            )
            
            if self.use_tls:
                # Create SSL context without certificate verification
                context = ssl.create_default_context()
                context.check_hostname = False
                context.verify_mode = ssl.CERT_NONE
                self.connection.starttls(context=context)
            
            if self.username and self.password:
                self.connection.login(self.username, self.password)
            return True
        except Exception:
            if not self.fail_silently:
                raise

