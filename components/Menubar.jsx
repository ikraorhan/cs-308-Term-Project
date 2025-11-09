import React from "react";
import { Link } from "react-router-dom";
import "./Menubar.css";

export default function Menubar({ user, onLogout }) {
  return (
    <nav className="menubar">
      <div className="logo">
        <Link to="/">Pet Shop 🐾</Link>
      </div>
      <div className="menu-links">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/about">About Us</Link>
        <Link to="/cart">Cart</Link>
      </div>
      <div className="user-section">
        {user ? (
          <>
            <span>{user.email}</span>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}