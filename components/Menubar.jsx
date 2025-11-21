import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Menubar.css";
import { authAPI, clearUserData } from "./api";

export default function Menubar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const authCheckedRef = useRef(false);

  const checkAuthStatus = async () => {
    const storedAuth = localStorage.getItem('is_authenticated');
    if (storedAuth === 'true') {
      try {
        const response = await authAPI.getCurrentUser();
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
          authCheckedRef.current = true;
        } else {
          setIsAuthenticated(false);
          authCheckedRef.current = false;
          clearUserData();
        }
      } catch (error) {
        setIsAuthenticated(false);
        authCheckedRef.current = false;
        clearUserData();
      }
    } else {
      setIsAuthenticated(false);
      authCheckedRef.current = false;
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'is_authenticated') {
        checkAuthStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically to catch login changes (when user logs in on same page)
    const interval = setInterval(() => {
      const currentAuth = localStorage.getItem('is_authenticated');
      const wasAuthenticated = authCheckedRef.current;
      
      if (currentAuth === 'true' && !wasAuthenticated) {
        // User just logged in - check auth status
        checkAuthStatus();
      } else if (currentAuth !== 'true' && wasAuthenticated) {
        // User just logged out - update state
        setIsAuthenticated(false);
        setUser(null);
        authCheckedRef.current = false;
      }
    }, 2000); // Check every 2 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []); // Only run on mount

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearUserData();
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login');
    }
  };

  const userName = user 
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
    : localStorage.getItem('user_name') || 'User';

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
        {!loading && (
          <>
            {isAuthenticated ? (
              <>
                <span className="user-email">{user?.email || localStorage.getItem('user_email') || userName}</span>
                <Link to="/profile" className="profile-link">
                  Profile
                </Link>
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link className="login-link" to="/login">
                Login
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
}