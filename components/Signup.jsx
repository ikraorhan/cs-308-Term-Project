import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';
import { authAPI, storeUserData } from './api';

function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter a valid email');
      return;
    }

    if (!formData.firstName.trim()) {
      setError('Please enter your first name');
      return;
    }

    setLoading(true);

    try {
      // Generate username from email (before @ symbol)
      const username = formData.email.split('@')[0].toLowerCase();
      
      // Prepare registration data
      const registrationData = {
        username: username,
        email: formData.email.toLowerCase(),
        password: formData.password,
        password2: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName || '',
      };

      // Call API to register
      const response = await authAPI.register(registrationData);
      
      if (response.data && response.data.user) {
        // Store user data in localStorage
        storeUserData(response.data.user);
        
        // Success - redirect to products page
        navigate('/products');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error) {
      // Handle API errors
      let errorMessage = 'Failed to sign up. Please try again.';
      
      // Check if error has detailed response
      if (error.message) {
        // Try to parse error response
        try {
          // If error has a response object, try to get detailed errors
          if (error.response) {
            const errorData = error.response.data || error.response;
            if (errorData.errors) {
              // Format validation errors
              const errorList = Object.entries(errorData.errors).map(([field, messages]) => {
                if (Array.isArray(messages)) {
                  return `${field}: ${messages.join(', ')}`;
                }
                return `${field}: ${messages}`;
              });
              errorMessage = errorList.join('\n');
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.detail) {
              errorMessage = errorData.detail;
            }
          } else {
            // Check for specific error messages from backend
            if (error.message.includes('email')) {
              errorMessage = 'This email is already registered. Please use a different email or login.';
            } else if (error.message.includes('username')) {
              errorMessage = 'This username is already taken. Please try a different email.';
            } else if (error.message.includes('password')) {
              errorMessage = error.message;
            } else {
              errorMessage = error.message;
            }
          }
        } catch (parseError) {
          // If parsing fails, use original error message
          errorMessage = error.message || 'Failed to sign up. Please try again.';
        }
      }
      
      setError(errorMessage);
      console.error('Signup error:', error);
      console.error('Error details:', error.response || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>
          <span className="signup-title-text">Create Account</span>
          <span className="paw-icon">🐾</span>
        </h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Enter your first name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name (Optional)</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password (min 6 characters)"
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="login-link">
          <span className="login-label">Already have an account?</span>{' '}
          <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;

