import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { authAPI, storeUserData } from './api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Try to login with email or username
      // Backend accepts username, so we'll use email as username (Django allows this)
      const response = await authAPI.login(email, password);
      
      if (response.data && response.data.user) {
        // Store user data in localStorage for frontend state
        storeUserData(response.data.user);
        
        // Success - redirect to products page
        navigate('/products');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (error) {
      // Handle API errors
      let errorMessage = 'Failed to login. Please check your credentials.';
      
      // Check if error has detailed response
      if (error.response) {
        const errorData = error.response.data || error.response;
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      console.error('Login error:', error);
      console.error('Error response:', error.response);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password', {
      state: email ? { email } : undefined,
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>
          <span className="login-title-text">Login to Pet Shop</span>
          <span className="paw-icon">🐾</span>
        </h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <button
          type="button"
          className="forgot-password-button"
          onClick={handleForgotPassword}
          disabled={loading}
        >
          Forgot password?
        </button>
        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
        <div className="mock-info">
          <small>Demo: admin@petstore.com / admin123</small>
        </div>
      </div>
    </div>
  );
}

export default Login;

