import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Menubar.css";
import { clearUserData } from "./api";

export default function Menubar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on mount and when location changes
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("is_authenticated") === "true";
      const adminStatus = localStorage.getItem("is_admin") === "true" ||
        localStorage.getItem("is_staff") === "true" ||
        localStorage.getItem("is_superuser") === "true";
      const email = localStorage.getItem("user_email") || "";
      const role = localStorage.getItem("user_role") || "customer";

      setIsAuthenticated(authStatus);
      setIsAdmin(adminStatus);
      setUserEmail(email);
      setRole(role);
    };

    // Check immediately
    checkAuth();
  }, [location]);

  // Listen for storage changes (when user logs in/out in another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const authStatus = localStorage.getItem("is_authenticated") === "true";
      const adminStatus = localStorage.getItem("is_admin") === "true" ||
        localStorage.getItem("is_staff") === "true" ||
        localStorage.getItem("is_superuser") === "true";
      const email = localStorage.getItem("user_email") || "";
      const role = localStorage.getItem("user_role") || "customer";

      setIsAuthenticated(authStatus);
      setIsAdmin(adminStatus);
      setUserEmail(email);
      setRole(role);
    };

    window.addEventListener("storage", handleStorageChange);
    // Also check on focus (in case login happened in same tab)
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Clear localStorage
      clearUserData();
      setIsAuthenticated(false);
      setIsAdmin(false);
      setRole("");
      setUserEmail("");

      // Dispatch custom event for chat widget to close
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('userLoggedOut'));

      // Navigate to login
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local data even if API call fails
      clearUserData();
      setIsAuthenticated(false);
      setIsAdmin(false);
      setRole("");
      setUserEmail("");

      // Dispatch custom event for chat widget to close
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('userLoggedOut'));

      navigate("/login");
    }
  };

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
        {isAuthenticated && <Link to="/wishlist">Wishlist</Link>}
        <Link to="/profile">Profile</Link>
        {(role === 'product_manager' || role === 'admin') && (
          <Link to="/product-manager">Product Manager</Link>
        )}
        {(role === 'sales_manager' || role === 'admin') && (
          <Link to="/sales-manager">Sales Manager</Link>
        )}
        {(role === 'support_manager' || role === 'admin') && (
          <Link to="/support/dashboard">Support Dashboard</Link>
        )}
      </div>
      <div className="user-section">
        {isAuthenticated ? (
          <>
            <span className="user-email">{userEmail}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link className="login-link" to="/login">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}