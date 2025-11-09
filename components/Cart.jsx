import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Cart.css";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  const calculateTotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
  };

  const subtotal = calculateTotal();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  return (
    <div className="cart-page">
      <h1>My Cart 🛒</h1>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>You haven't added any items yet.</p>
          <Link to="/products">
            <button className="shop-button">Start Shopping</button>
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img
                    src={item.image_url || "https://via.placeholder.com/100x100?text=Product"}
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/100x100?text=Product";
                    }}
                  />
                </div>
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <p className="item-price">${(item.price || 0).toFixed(2)}</p>
                </div>
                <div className="cart-item-controls">
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity || 1}</span>
                    <button
                      onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
                <div className="cart-item-total">
                  <strong>
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </strong>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span className="free-shipping">Free</span>
            </div>
            <div className="summary-row total-row">
              <span>Total:</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <button className="checkout-button">Proceed to Checkout</button>
            <Link to="/products">
              <button className="continue-shopping">Continue Shopping</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}