from rest_framework import serializers
from .models import Campaign
from product_manager_api.models import Product

class CampaignSerializer(serializers.ModelSerializer):
    product_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Campaign
        fields = ['id', 'title', 'description', 'discount_percentage', 'start_date', 'end_date', 'status', 'products', 'product_ids', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'products']

    def create(self, validated_data):
        product_ids = validated_data.pop('product_ids', [])
        campaign = Campaign.objects.create(**validated_data)
        if product_ids:
            products = Product.objects.filter(id__in=product_ids)
            campaign.products.set(products)
        return campaign

    def update(self, instance, validated_data):
        product_ids = validated_data.pop('product_ids', None)
        campaign = super().update(instance, validated_data)
        if product_ids is not None:
            products = Product.objects.filter(id__in=product_ids)
            instance.products.set(products)
        return campaign

class ProductPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'model', 'price', 'cost']
        read_only_fields = ['id', 'name', 'model']
