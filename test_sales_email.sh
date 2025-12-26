#!/bin/bash

# Sales Email Automation - Quick Test Script
# Bu script demo için hızlı test yapmanızı sağlar

echo "=========================================="
echo "Sales Email Automation - Test Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Django is available
if ! command -v python &> /dev/null; then
    echo -e "${RED}Error: Python not found${NC}"
    exit 1
fi

echo -e "${YELLOW}1. Testing dry-run (no emails will be sent)...${NC}"
python manage.py send_sales_emails \
  --subject "Test Email - Dry Run" \
  --message "Bu bir test mesajıdır. Email gönderilmeyecek." \
  --dry-run

echo ""
echo -e "${GREEN}✓ Dry-run test completed${NC}"
echo ""

# Ask if user wants to send real email
read -p "Gerçek email göndermek istiyor musunuz? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}2. Sending test email (limit 1)...${NC}"
    python manage.py send_sales_emails \
      --subject "🐾 Test Email - Pet Store" \
      --message "Merhaba! Bu bir test emailidir. Sistem çalışıyor!" \
      --limit 1
    
    echo ""
    echo -e "${GREEN}✓ Test email sent!${NC}"
    echo ""
    echo -e "${YELLOW}Email'inizi kontrol edin!${NC}"
else
    echo -e "${YELLOW}Skipping real email send${NC}"
fi

echo ""
echo "=========================================="
echo "Test completed!"
echo "=========================================="

