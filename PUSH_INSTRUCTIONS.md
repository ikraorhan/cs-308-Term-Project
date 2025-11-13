# Push to GitHub

Branch: arda/products-orders-database

## Push command

```bash
git push -u origin arda/products-orders-database
```

If you need to authenticate:
```bash
gh auth login
```

Then push again.

## After pushing

1. Go to GitHub repo
2. Create pull request from arda/products-orders-database to main
3. Tag Mert for review

## Integration note

Order model uses customer_id as CharField. When Mert adds Customer model, we can change it to ForeignKey.

