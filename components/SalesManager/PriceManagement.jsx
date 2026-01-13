import React, { useState, useEffect } from 'react';
import { productManagerAPI } from '../api';
import './PriceManagement.css';

function PriceManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [price, setPrice] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productManagerAPI.getManagerProducts();
      setProducts(response.data.products || []);
      setError('');
    } catch (err) {
      setError('Failed to load products');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setPrice(product.price || '');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }

    if (!price || price === '') {
      setError('Please enter a price');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      setError('Price must be a valid number greater than or equal to 0');
      return;
    }

    try {
      const response = await productManagerAPI.setProductPrice({
        product_id: selectedProduct.id,
        price: priceValue
      });

      setSuccess(`Price updated successfully! Product: ${response.data.product.name}, New Price: ${response.data.product.new_price} TL`);
      setSelectedProduct(null);
      setPrice('');
      fetchProducts(); // Refresh products to show updated prices
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update price';
      setError(errorMessage);
      console.error('Error updating price:', err);
      if (err.response?.data?.trace) {
        console.error('Trace:', err.response.data.trace);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  if (loading) {
    return <div className="price-loading">Loading products...</div>;
  }

  return (
    <div className="price-management-container">
      <h1 className="price-title">Product Price Management</h1>

      {error && <div className="price-error">{error}</div>}
      {success && <div className="price-success">{success}</div>}

      <div className="price-management-content">
        <div className="products-list-section">
          <h2>Select Product</h2>
          <div className="products-grid">
            {products.map((product) => (
              <div
                key={product.id}
                className={`product-card ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                onClick={() => handleProductSelect(product)}
              >
                <div className="product-card-header">
                  <h3>{product.name}</h3>
                  {selectedProduct?.id === product.id && (
                    <span className="selected-badge">Selected</span>
                  )}
                </div>
                <div className="product-card-body">
                  <p className="product-model">{product.model}</p>
                  <p className="product-price">Current Price: {formatCurrency(product.price)}</p>
                  {product.original_price && product.original_price !== product.price && (
                    <p className="product-original-price">
                      Original: {formatCurrency(product.original_price)}
                    </p>
                  )}
                  <p className="product-stock">Stock: {product.quantity_in_stock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedProduct && (
          <div className="price-form-section">
            <h2>Set Price for: {selectedProduct.name}</h2>
            <form onSubmit={handleSubmit} className="price-form">
              <div className="form-group">
                <label htmlFor="current-price">Current Price:</label>
                <input
                  type="text"
                  id="current-price"
                  value={formatCurrency(selectedProduct.price)}
                  disabled
                  className="form-input disabled"
                />
              </div>

              {selectedProduct.original_price && selectedProduct.original_price !== selectedProduct.price && (
                <div className="form-group">
                  <label htmlFor="original-price">Original Price:</label>
                  <input
                    type="text"
                    id="original-price"
                    value={formatCurrency(selectedProduct.original_price)}
                    disabled
                    className="form-input disabled"
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="new-price">New Price (TL):</label>
                <input
                  type="number"
                  id="new-price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                  className="form-input"
                  placeholder="Enter new price"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  Update Price
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setSelectedProduct(null);
                    setPrice('');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default PriceManagement;

