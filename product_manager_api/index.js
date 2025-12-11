// src/product_manager_api/index.js

const API_BASE_URL = "http://localhost:8000";



export const productsAPI = {
  async getProducts(params = {}) {
    try {
      // 1. Fetch live data from backend
      const response = await fetch(`${API_BASE_URL}/products/`);

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const result = await response.json();
      let liveProducts = result.products || [];



      // 3. Apply Filtering Locally (matching previous behavior)
      let filteredProducts = [...liveProducts];

      // Category filter
      if (params.category) {
        filteredProducts = filteredProducts.filter(
          (p) => p.category === params.category
        );
      }

      // Search filter
      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        filteredProducts = filteredProducts.filter(
          (p) =>
            (p.name || "").toLowerCase().includes(searchTerm) ||
            (p.description || "").toLowerCase().includes(searchTerm)
        );
      }

      if (params.sort === "price") {
        filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      } else if (params.sort === "popularity") {
        // Sort by average rating (descending)
        filteredProducts.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
      }

      return { data: filteredProducts };

    } catch (error) {
      console.error("Failed to fetch products from API, falling back to empty list:", error);
      return { data: [] };
    }
  },
};
