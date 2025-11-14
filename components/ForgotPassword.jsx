import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import { authAPI } from './api';

function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const presetEmail = useMemo(
    () => location.state?.email?.toLowerCase() ?? '',
    [location.state]
  );

  const [email, setEmail] = useState(presetEmail);
  const [uid, setUid] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [mode, setMode] = useState(presetEmail ? 'reset' : 'request');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (presetEmail) {
      setEmail(presetEmail);
    }
  }, [presetEmail]);

  const handleRequestLink = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setProcessing(true);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Please enter the email associated with your account.');
      setProcessing(false);
      return;
    }

    try {
      const response = await authAPI.requestPasswordReset(normalizedEmail);
      
      if (response.data) {
        // In development mode, backend returns reset_link with uid and token
        if (response.data.reset_link) {
          const url = new URL(response.data.reset_link);
          const uidParam = url.searchParams.get('uid');
          const tokenParam = url.searchParams.get('token');
          
          if (uidParam && tokenParam) {
            setUid(uidParam);
            setToken(tokenParam);
            setInfo(
              `Password reset link generated! In development mode, you can use the token below. In production, check your email at ${normalizedEmail}.`
            );
            setMode('reset');
          } else {
            setInfo(response.data.message || 'Password reset link has been sent to your email.');
            setMode('reset');
          }
        } else {
          setInfo(response.data.message || 'Password reset link has been sent to your email.');
          setMode('reset');
        }
      }
    } catch (err) {
      console.error('Reset link request failed:', err);
      setError(err.message || 'Unable to generate a reset link. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setProcessing(true);

    if (!uid.trim()) {
      setError('Reset link is missing. Please request a new reset link.');
      setProcessing(false);
      return;
    }

    if (!token.trim()) {
      setError('Please enter the reset token.');
      setProcessing(false);
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password.');
      setProcessing(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setProcessing(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setProcessing(false);
      return;
    }

    try {
      const resetData = {
        uid: uid.trim(),
        token: token.trim(),
        new_password: newPassword,
        new_password2: confirmPassword,
      };

      const response = await authAPI.confirmPasswordReset(resetData);
      
      if (response.data && response.data.message) {
        setInfo('Password successfully updated! Redirecting to login...');
        setMode('success');
        setTimeout(() => navigate('/login'), 1800);
      } else {
        setError('Password reset failed. Please try again.');
      }
    } catch (err) {
      console.error('Password reset failed:', err);
      const errorMessage = err.message || 'Unable to reset password. Please try again.';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const renderContent = () => {
    if (mode === 'success') {
      return (
        <div className="success-state">
          <p>You can now sign in with your new password.</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate('/login')}
          >
            Back to login
          </button>
        </div>
      );
    }

    if (mode === 'request') {
      return (
        <form onSubmit={handleRequestLink}>
          <div className="form-group">
            <label htmlFor="reset-email">Email</label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          <button type="submit" className="primary-button" disabled={processing}>
            {processing ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      );
    }

    return (
      <form onSubmit={handleResetPassword}>
        <div className="form-group">
          <label htmlFor="reset-email">Email</label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email address"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reset-token">Reset token</label>
          <input
            id="reset-token"
            type="text"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Paste the token from the email/console"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Choose a new password"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm password</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm your new password"
            required
          />
        </div>
        <button
          type="submit"
          className="primary-button"
          disabled={processing}
        >
          {processing ? 'Updating...' : 'Reset password'}
        </button>
      </form>
    );
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>
          <span className="title-text">Reset your password</span>
          <span className="paw-icon">🐾</span>
        </h2>
        <p className="subtitle">
          Enter your email to receive a reset token, then use it to set a new
          password.
        </p>
        {error && <div className="error-message">{error}</div>}
        {info && mode !== 'success' && (
          <div className="info-message">{info}</div>
        )}
        {renderContent()}
        {mode !== 'success' && (
          <p className="helper-text">
            Remembered your password? <Link to="/login">Back to login</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;




