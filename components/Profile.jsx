import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { authAPI, clearUserData } from './api';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('is_authenticated');
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch user data from API
    fetchUserData();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.getCurrentUser();
      if (response.data) {
        setUser(response.data);
        // Update localStorage with latest user data
        if (response.data.id) {
          localStorage.setItem('user_id', response.data.id);
          localStorage.setItem('user_email', response.data.email || '');
          localStorage.setItem('user_name', `${response.data.first_name || ''} ${response.data.last_name || ''}`.trim() || response.data.username);
          localStorage.setItem('user_username', response.data.username);
          localStorage.setItem('is_authenticated', 'true');
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load profile. Please try again.');
      // If unauthorized, redirect to login
      if (err.response?.status === 401 || err.response?.status === 403) {
        clearUserData();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearUserData();
      navigate('/login');
    }
  };

  const formatDate = (value) => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(value));
    } catch (error) {
      return value;
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p className="error-message">{error}</p>
          <button onClick={fetchUserData}>Retry</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>No user data available. Please log in again.</p>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  const isAdmin = user.is_admin || user.is_staff || user.is_superuser;
  const profile = user.profile || {};
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;

  // Admin Profile View
  if (isAdmin) {
    return (
      <div className="profile-page">
        <section className="profile-hero">
          <div className="profile-identity">
            <div className="avatar-circle">
              <span role="img" aria-label="Admin">👑</span>
            </div>
            <div>
              <h1>{fullName} (Admin)</h1>
              <p className="profile-hero-subtitle">Administrator Account</p>
              <div className="profile-contact-line">
                <span>{user.email}</span>
                {profile.phone && (
                  <>
                    <span>•</span>
                    <span>{profile.phone}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="profile-badges">
            <div className="badge">
              <span className="badge-label">Role</span>
              <span className="badge-value">Admin</span>
              <small>System Administrator</small>
            </div>
            <div className="badge">
              <span className="badge-label">Member Since</span>
              <span className="badge-value">{formatDate(user.date_joined)}</span>
              <small>Account Created</small>
            </div>
            <div className="badge">
              <span className="badge-label">Username</span>
              <span className="badge-value">{user.username}</span>
              <small>Login ID</small>
            </div>
          </div>
        </section>

        <section className="profile-grid">
          <article className="profile-card">
            <header>
              <h2>Admin Information</h2>
              <p>Administrator account details and access information.</p>
            </header>
            <div style={{ padding: '20px' }}>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>First Name:</strong> {user.first_name || 'Not set'}</p>
              <p><strong>Last Name:</strong> {user.last_name || 'Not set'}</p>
              <p><strong>Account Created:</strong> {formatDate(user.date_joined)}</p>
              {user.is_superuser && <p><strong>Superuser:</strong> Yes</p>}
              {user.is_staff && <p><strong>Staff:</strong> Yes</p>}
            </div>
          </article>

          <article className="profile-card">
            <header>
              <h2>Admin Actions</h2>
              <p>Quick access to administrative functions.</p>
            </header>
            <div style={{ padding: '20px' }}>
              <button 
                type="button" 
                className="primary-button"
                onClick={() => window.location.href = '/product-manager/dashboard'}
                style={{ marginBottom: '10px', width: '100%' }}
              >
                Go to Product Manager Dashboard
              </button>
              <button 
                type="button" 
                className="primary-button"
                onClick={() => window.location.href = '/admin'}
                style={{ marginBottom: '10px', width: '100%' }}
              >
                Go to Django Admin
              </button>
            </div>
          </article>
        </section>

        <section className="profile-footer">
          <button type="button" className="signout-button" onClick={handleSignOut}>
            Sign out
          </button>
        </section>
      </div>
    );
  }

  // Regular User Profile View (with empty fields by default)
  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-identity">
          <div className="avatar-circle">
            <span role="img" aria-label="Paw print">🐾</span>
          </div>
          <div>
            <h1>{fullName}</h1>
            <p className="profile-hero-subtitle">{profile.bio || 'Welcome to your profile! Fill in your information to get started.'}</p>
            <div className="profile-contact-line">
              <span>{user.email}</span>
              {profile.phone && (
                <>
                  <span>•</span>
                  <span>{profile.phone}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="profile-badges">
          <div className="badge">
            <span className="badge-label">Membership</span>
            <span className="badge-value">{profile.loyalty_tier || 'Standard'}</span>
            <small>Member Since: {formatDate(user.date_joined)}</small>
          </div>
          <div className="badge">
            <span className="badge-label">Loyalty points</span>
            <span className="badge-value">{profile.loyalty_points?.toLocaleString('en-US') || '0'}</span>
            <small>Pet Care Club</small>
          </div>
          <div className="badge">
            <span className="badge-label">Pets supported</span>
            <span className="badge-value">{profile.pets_supported || '0'}</span>
            <small>Best friend</small>
          </div>
        </div>
      </section>

      <section className="profile-grid">
        <article className="profile-card">
          <header>
            <h2>Personal Information</h2>
            <p>Your account details and contact information.</p>
          </header>
          <div style={{ padding: '20px' }}>
            <p><strong>Email:</strong> {user.email || 'Not set'}</p>
            <p><strong>Phone:</strong> {profile.phone || 'Not set'}</p>
            <p><strong>First Name:</strong> {user.first_name || 'Not set'}</p>
            <p><strong>Last Name:</strong> {user.last_name || 'Not set'}</p>
            <p><strong>Bio:</strong> {profile.bio || 'No bio added yet'}</p>
            <p><strong>Member Since:</strong> {formatDate(user.date_joined)}</p>
          </div>
        </article>

        <article className="profile-card">
          <header>
            <h2>Loyalty Program</h2>
            <p>Your loyalty tier and points information.</p>
          </header>
          <div style={{ padding: '20px' }}>
            <p><strong>Tier:</strong> {profile.loyalty_tier || 'Standard'}</p>
            <p><strong>Points:</strong> {profile.loyalty_points || 0}</p>
            <p><strong>Pets Supported:</strong> {profile.pets_supported || 0}</p>
          </div>
        </article>

        <article className="profile-card">
          <header>
            <h2>Account Settings</h2>
            <p>Manage your account preferences.</p>
          </header>
          <div style={{ padding: '20px' }}>
            <p>Profile editing coming soon...</p>
          </div>
        </article>
      </section>

      <section className="profile-footer">
        <button type="button" className="signout-button" onClick={handleSignOut}>
          Sign out
        </button>
      </section>
    </div>
  );
}

export default Profile;
