import React, { useState, useEffect } from 'react';
import { productManagerAPI } from '../api';
import './DiscountManagement.css';

function DiscountManagement() {
  const [productIds, setProductIds] = useState('');
  const [discountRate, setDiscountRate] = useState('');
  const [discountStartDate, setDiscountStartDate] = useState('');
  const [discountEndDate, setDiscountEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState(null);
  
  // Wishlist test için
  const [wishlistUserId, setWishlistUserId] = useState('test-user-1');
  const [wishlistUserEmail, setWishlistUserEmail] = useState('test@example.com');
  const [wishlistProductId, setWishlistProductId] = useState('');
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const handleApplyDiscount = async () => {
    if (!productIds.trim()) {
      setError('Please enter product IDs (comma-separated)');
      return;
    }

    if (!discountRate || discountRate < 0 || discountRate > 100) {
      setError('Please enter a valid discount rate (0-100)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setResult(null);

      // Parse product IDs
      const ids = productIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

      if (ids.length === 0) {
        setError('Please enter valid product IDs');
        setLoading(false);
        return;
      }

      const discountData = {
        product_ids: ids,
        discount_rate: parseFloat(discountRate),
      };

      if (discountStartDate) {
        discountData.discount_start_date = new Date(discountStartDate).toISOString();
      }

      if (discountEndDate) {
        discountData.discount_end_date = new Date(discountEndDate).toISOString();
      }

      console.log('Sending discount data:', discountData);

      const response = await productManagerAPI.applyDiscount(discountData);
      
      setResult(response.data);
      setSuccess(
        `Discount applied to ${response.data.updated_products.length} product(s). ` +
        `${response.data.notified_users_count} user(s) notified.`
      );
      
      // Reset form
      setProductIds('');
      setDiscountRate('');
      setDiscountStartDate('');
      setDiscountEndDate('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to apply discount');
      console.error('Error applying discount:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="discount-management-container">
      <h1 className="discount-management-title">Sales Manager - Discount & Email Test</h1>

      {error && <div className="discount-error">{error}</div>}
      {success && <div className="discount-success">{success}</div>}

      <div className="discount-test-section">
        <h2>📧 Apply Discount & Send Email Notifications</h2>
        <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
          <strong>How it works:</strong> When you apply a discount to products, users who have those products in their wishlist will automatically receive an email notification. 
          <br />📝 <strong>Step 1:</strong> Add products to wishlist (below) → <strong>Step 2:</strong> Apply discount (here) → <strong>Step 3:</strong> Check results to see who received emails!
        </p>
        
        <div className="discount-form">
          <div className="form-group">
            <label htmlFor="product-ids">Product IDs (comma-separated, e.g., 1,2,3):</label>
            <input
              id="product-ids"
              type="text"
              value={productIds}
              onChange={(e) => setProductIds(e.target.value)}
              placeholder="e.g., 1,2,3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="discount-rate">Discount Rate (%):</label>
            <input
              id="discount-rate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={discountRate}
              onChange={(e) => setDiscountRate(e.target.value)}
              placeholder="e.g., 20"
            />
          </div>

          <div className="form-group">
            <label htmlFor="discount-start-date">Start Date (Optional):</label>
            <input
              id="discount-start-date"
              type="datetime-local"
              value={discountStartDate}
              onChange={(e) => setDiscountStartDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="discount-end-date">End Date (Optional):</label>
            <input
              id="discount-end-date"
              type="datetime-local"
              value={discountEndDate}
              onChange={(e) => setDiscountEndDate(e.target.value)}
            />
          </div>

          <button
            className="btn-apply-discount"
            onClick={handleApplyDiscount}
            disabled={loading || !productIds.trim() || !discountRate}
          >
            {loading ? 'Applying Discount & Sending Emails...' : 'Apply Discount & Send Notifications'}
          </button>
        </div>

        {result && (
          <div className="result-section">
            <h3>Result:</h3>
            <div className="result-details">
              <p><strong>Updated Products:</strong> {result.updated_products.length}</p>
              {result.updated_products.map((product, index) => (
                <div key={index} className="product-result">
                  <p>• {product.name}: {product.original_price} TRY → {product.new_price} TRY ({product.discount_rate}% off)</p>
                </div>
              ))}
              
              <div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '6px', border: '2px solid #4caf50' }}>
                <p style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>
                  📧 Email Notifications: {result.notified_users_count} user(s) notified
                </p>
                {result.notified_users && result.notified_users.length > 0 ? (
                  <div className="notified-users">
                    <p style={{ color: '#1b5e20', fontWeight: '600', marginBottom: '8px' }}>✅ Emails successfully sent to:</p>
                    {result.notified_users.map((user, index) => (
                      <div key={index} className="user-result" style={{ background: 'white', padding: '8px', margin: '5px 0', borderRadius: '4px' }}>
                        <p style={{ margin: 0, color: '#2e7d32' }}>📨 <strong>{user.email}</strong> - Product: {user.product_name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>ℹ️ No users have these products in their wishlist</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wishlist Test Section */}
      <div className="discount-test-section" style={{ marginTop: '30px' }}>
        <h2>Test: Add Product to Wishlist</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Önce wishlist'e ürün ekleyin, sonra discount uygulayın. Mail gönderilecek.
        </p>
        
        <div className="discount-form">
          <div className="form-group">
            <label htmlFor="wishlist-user-id">User ID:</label>
            <input
              id="wishlist-user-id"
              type="text"
              value={wishlistUserId}
              onChange={(e) => setWishlistUserId(e.target.value)}
              placeholder="e.g., test-user-1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="wishlist-email">User Email (Mail gönderilecek adres):</label>
            <input
              id="wishlist-email"
              type="email"
              value={wishlistUserEmail}
              onChange={(e) => setWishlistUserEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="wishlist-product-id">Product ID:</label>
            <input
              id="wishlist-product-id"
              type="number"
              value={wishlistProductId}
              onChange={(e) => setWishlistProductId(e.target.value)}
              placeholder="e.g., 1"
            />
          </div>

          <button
            className="btn-apply-discount"
            onClick={async () => {
              if (!wishlistProductId) {
                setError('Please enter a product ID');
                return;
              }
              try {
                setWishlistLoading(true);
                setError('');
                const response = await productManagerAPI.addToWishlist({
                  user_id: wishlistUserId,
                  user_email: wishlistUserEmail,
                  product_id: parseInt(wishlistProductId),
                });
                setSuccess(`Product added to wishlist! ${response.data.message}`);
                setWishlistProductId('');
              } catch (err) {
                setError(err.response?.data?.error || err.message || 'Failed to add to wishlist');
              } finally {
                setWishlistLoading(false);
              }
            }}
            disabled={wishlistLoading || !wishlistProductId}
          >
            {wishlistLoading ? 'Adding...' : 'Add to Wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiscountManagement;
