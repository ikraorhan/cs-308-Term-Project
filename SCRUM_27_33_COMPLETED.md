# SCRUM-27 and SCRUM-33

## What I did

SCRUM-27: Products table
- Created Product model in models.py
- Made migrations and ran them
- Updated views.py to use database instead of mock data

SCRUM-33: Orders table  
- Created Order model in models.py
- Made migrations and ran them
- Updated order views to use database

## Files changed

- backend/product_manager_api/models.py (new)
- backend/product_manager_api/admin.py (new)
- backend/product_manager_api/views.py (updated)
- backend/product_manager_api/migrations/0001_initial.py (new)

## Models

Product has: name, model, serial_number, description, quantity_in_stock, price, warranty_status, distributor, category, cost

Order has: delivery_id, customer_id, customer_name, customer_email, product_id, product_name, quantity, total_price, delivery_address, status, order_date, delivery_date

## Notes

Order uses customer_id as CharField for now. When Mert adds Customer model in auth_api, we can change it to ForeignKey.

All API endpoints now use the database.

