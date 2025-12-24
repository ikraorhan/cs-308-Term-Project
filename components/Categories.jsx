import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productsAPI } from "../product_manager_api";
import { productManagerAPI } from "./api"; // Import main API
import "./Categories.css";

export default function Categories() {
  const [categoryData, setCategoryData] = useState({});
  const [categoriesList, setCategoriesList] = useState([]); // Store list of categories
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch Categories
        const catResponse = await productManagerAPI.getCategories();
        const categories = catResponse?.data?.categories || [];
        setCategoriesList(categories);

        // 2. Fetch Products
        const prodResponse = await productsAPI.getProducts({});
        const products = prodResponse?.data ?? [];

        // 3. Group products by category
        const grouped = {};
        // Initialize all categories with empty array
        categories.forEach(cat => grouped[cat] = []);

        // Fill properly
        products.forEach((p) => {
          if (grouped[p.category]) {
            grouped[p.category].push(p);
          } else if (categories.includes(p.category)) {
            // Should verify against known categories, or add dynamic ones if products have them
            grouped[p.category].push(p);
          }
        });

        setCategoryData(grouped);
      } catch (err) {
        console.error("Error loading categories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  if (loading) {
    return <div className="categories-page">Loading categories...</div>;
  }

  return (
    <div className="categories-page">
      <h1>Product Categories</h1>
      <p className="categories-subtitle">
        Browse our wide selection of pet products by category
      </p>

      <div className="categories-grid">
        {categoriesList.map((category) => {
          const products = categoryData[category] || [];
          const totalProducts = products.length;
          const totalStock = products.reduce(
            (sum, p) => sum + (p.quantity_in_stock || 0),
            0
          );

          return (
            <div
              key={category}
              className="category-card"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="category-card-header">
                <h3>{category}</h3>
                <p>{totalProducts} product{totalProducts !== 1 ? "s" : ""}</p>
              </div>
              <div className="category-products">
                {products.slice(0, 3).map((product) => (
                  <div key={product.id} className="category-product-item">
                    <div className="category-product-info">
                      <strong>{product.name}</strong>
                      <span>${product.price.toFixed(2)}</span>
                    </div>
                    <small>Stock: {product.quantity_in_stock || 0}</small>
                  </div>
                ))}
                {totalProducts > 3 && (
                  <div className="category-more">
                    +{totalProducts - 3} more product
                    {totalProducts - 3 !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
              <div className="category-footer">
                <span>Total Stock: {totalStock}</span>
                <button className="view-category-btn">View All →</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

