import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { authAPI, clearUserData } from './api';

const PROFILE_STORAGE_KEY = 'user_profile_extended';

// Dummy data for admin users (demo purposes)
const ADMIN_DUMMY_DATA = {
  addresses: [
    {
      id: 'addr-istanbul',
      label: 'Home Nest',
      recipient: 'Admin User',
      phone: '+90 555 123 4567',
      lines: ['Akasyalı Street No: 21', 'Apt 4'],
      city: 'Kadıköy, Istanbul',
      postalCode: '34710',
      notes: 'Leave at the concierge. Loki (cat) is friendly.',
      isDefault: true,
    },
    {
      id: 'addr-office',
      label: 'Studio Loft',
      recipient: 'Admin User',
      phone: '+90 532 987 6543',
      lines: ['Maslak Mah. AOS 55. Street', 'No: 2 / 12'],
      city: 'Sarıyer, Istanbul',
      postalCode: '34398',
      notes: 'Deliver before 5 PM, front desk will sign.',
      isDefault: false,
    },
  ],
  recentOrders: [
    {
      id: 'ORD-89214',
      date: '2025-10-29',
      status: 'Delivered',
      total: 1189.5,
      currency: 'TRY',
      items: [
        {
          name: 'Holistic Salmon Kibble',
          quantity: 2,
          thumbnail: '/public/images/cat-adult-salmon.jpeg',
        },
        {
          name: 'Organic Catnip Spray',
          quantity: 1,
        },
      ],
    },
    {
      id: 'ORD-88702',
      date: '2025-09-14',
      status: 'In transit',
      total: 749.9,
      currency: 'TRY',
      items: [
        {
          name: 'Grain-free Puppy Kit',
          quantity: 1,
          thumbnail: '/public/images/puppy-chicken.jpeg',
        },
        {
          name: 'Soft Comfort Harness',
          quantity: 1,
        },
      ],
    },
    {
      id: 'ORD-87940',
      date: '2025-08-03',
      status: 'Completed',
      total: 542.0,
      currency: 'TRY',
      items: [
        {
          name: 'Calming Cat Cave',
          quantity: 1,
        },
        {
          name: 'Freeze-dried Treat Variety Pack',
          quantity: 1,
        },
      ],
    },
  ],
  careNotes: [
    {
      id: 'note-loki',
      pet: 'Loki',
      type: 'Cat · 4 years old',
      text: 'Prefers grain-free food and bamboo litter. Allergic to chicken.',
    },
    {
      id: 'note-mira',
      pet: 'Mira',
      type: 'Golden Retriever · 2 years old',
      text: 'Monthly grooming on the 12th. Needs hip-friendly supplements.',
    },
  ],
  scheduled: [
    {
      id: 'sched-vet',
      title: 'Veterinary check-up',
      date: '2025-11-24',
      time: '18:30',
      location: 'Hale Veterinary Clinic, Moda',
      notes: 'Bring Loki\'s vaccination booklet.',
    },
    {
      id: 'sched-grooming',
      title: 'Grooming session',
      date: '2025-12-02',
      time: '11:00',
      location: 'Pawsitive Groomers, Nişantaşı',
      notes: 'Full coat care & nail trim for Mira.',
    },
  ],
  favorites: ['Holistic Salmon Kibble', 'Bamboo Litter Refills', 'Interactive Feather Wand'],
};

// Default extended profile structure - always includes dummy data for all users
const getDefaultExtendedProfile = (userData) => ({
  phone: userData?.profile?.phone || '',
  bio: userData?.profile?.bio || 'Premium member who loves caring for rescued pets and exploring sustainable products.',
  addresses: ADMIN_DUMMY_DATA.addresses,
  preferences: {
    orderReminders: {
      label: 'Order reminders',
      description: 'Notify me when it\'s time to restock essentials.',
      enabled: true,
    },
    wellnessTips: {
      label: 'Weekly wellness tips',
      description: 'Curated care tips tailored to my pets.',
      enabled: true,
    },
    earlyAccess: {
      label: 'Early access drops',
      description: 'Get notified about limited collection launches.',
      enabled: false,
    },
    smsUpdates: {
      label: 'SMS delivery updates',
      description: 'Shipping progress and delivery confirmations via SMS.',
      enabled: true,
    },
  },
  recentOrders: ADMIN_DUMMY_DATA.recentOrders,
  careNotes: ADMIN_DUMMY_DATA.careNotes,
  scheduled: ADMIN_DUMMY_DATA.scheduled,
  favorites: ADMIN_DUMMY_DATA.favorites,
});

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [extendedProfile, setExtendedProfile] = useState(null);
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
        
        // Load or initialize extended profile from localStorage
        const storedExtended = localStorage.getItem(`${PROFILE_STORAGE_KEY}_${response.data.id}`);
        let extended = getDefaultExtendedProfile(response.data);
        
        if (storedExtended) {
          try {
            const parsed = JSON.parse(storedExtended);
            // Merge with defaults, preserving user's saved data
            // Always use dummy data as fallback if arrays are empty
            extended = {
              ...extended,
              ...parsed,
              // Ensure phone and bio are synced from backend if available
              phone: response.data.profile?.phone || parsed.phone || '',
              bio: response.data.profile?.bio || parsed.bio || 'Premium member who loves caring for rescued pets and exploring sustainable products.',
              // Always use dummy data if stored arrays are empty or missing
              addresses: (parsed.addresses && parsed.addresses.length > 0) ? parsed.addresses : ADMIN_DUMMY_DATA.addresses,
              recentOrders: (parsed.recentOrders && parsed.recentOrders.length > 0) ? parsed.recentOrders : ADMIN_DUMMY_DATA.recentOrders,
              careNotes: (parsed.careNotes && parsed.careNotes.length > 0) ? parsed.careNotes : ADMIN_DUMMY_DATA.careNotes,
              scheduled: (parsed.scheduled && parsed.scheduled.length > 0) ? parsed.scheduled : ADMIN_DUMMY_DATA.scheduled,
              favorites: (parsed.favorites && parsed.favorites.length > 0) ? parsed.favorites : ADMIN_DUMMY_DATA.favorites,
            };
          } catch (err) {
            console.warn('Failed to parse extended profile, using defaults', err);
            // On error, re-initialize with defaults (includes dummy data)
            extended = getDefaultExtendedProfile(response.data);
          }
        } else {
          // First time - sync phone and bio from backend
          // Dummy data is already set in getDefaultExtendedProfile
          extended.phone = response.data.profile?.phone || '';
          extended.bio = response.data.profile?.bio || 'Premium member who loves caring for rescued pets and exploring sustainable products.';
        }
        setExtendedProfile(extended);
        
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

  // Save extended profile to localStorage whenever it changes
  useEffect(() => {
    if (extendedProfile && user?.id) {
      localStorage.setItem(`${PROFILE_STORAGE_KEY}_${user.id}`, JSON.stringify(extendedProfile));
    }
  }, [extendedProfile, user?.id]);

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

  const handleTogglePreference = (key) => {
    setExtendedProfile((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: {
          ...prev.preferences[key],
          enabled: !prev.preferences[key].enabled,
        },
      },
    }));
  };

  const handleSetDefaultAddress = (id) => {
    setExtendedProfile((prev) => ({
      ...prev,
      addresses: prev.addresses.map((address) => ({
        ...address,
        isDefault: address.id === id,
      })),
    }));
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
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

  if (!user || !extendedProfile) {
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
  const backendProfile = user.profile || {};
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
  
  // Merge backend data with extended profile
  // Always use dummy data (already included in extendedProfile)
  const profile = {
    name: fullName,
    email: user.email,
    phone: extendedProfile.phone || backendProfile.phone || '',
    bio: extendedProfile.bio || backendProfile.bio || 'Premium member who loves caring for rescued pets and exploring sustainable products.',
    memberSince: user.date_joined,
    loyaltyTier: backendProfile.loyalty_tier || 'Standard',
    points: backendProfile.loyalty_points || 0,
    petsSupported: backendProfile.pets_supported || 0,
    addresses: extendedProfile.addresses || ADMIN_DUMMY_DATA.addresses,
    preferences: extendedProfile.preferences || {},
    recentOrders: extendedProfile.recentOrders || ADMIN_DUMMY_DATA.recentOrders,
    careNotes: extendedProfile.careNotes || ADMIN_DUMMY_DATA.careNotes,
    scheduled: extendedProfile.scheduled || ADMIN_DUMMY_DATA.scheduled,
    favorites: extendedProfile.favorites || ADMIN_DUMMY_DATA.favorites,
  };

  // Admin Profile View - Enhanced with rich UI
  if (isAdmin) {
    return (
      <div className="profile-page">
        <section className="profile-hero">
          <div className="profile-identity">
            <div className="avatar-circle">
              <span role="img" aria-label="Admin">👑</span>
            </div>
            <div>
              <h1>{profile.name} (Admin)</h1>
              <p className="admin-badge" style={{ marginTop: '8px', fontSize: '14px', color: '#7c5cb0' }}>Administrator Account</p>
              <p className="profile-hero-subtitle">{profile.bio || 'System Administrator'}</p>
              <div className="profile-contact-line">
                <span>{profile.email}</span>
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
              <span className="badge-value">{formatDate(profile.memberSince)}</span>
              <small>Account Created</small>
            </div>
            <div className="badge">
              <span className="badge-label">Username</span>
              <span className="badge-value">{user.username}</span>
              <small>Login ID</small>
            </div>
          </div>
        </section>

        <section className="admin-actions" style={{ marginBottom: '40px' }}>
          <h2>Admin Actions</h2>
          <div className="admin-links">
            <a href="/product-manager/dashboard" className="admin-link-button">
              Product Manager Dashboard
            </a>
            <a href="/admin/" className="admin-link-button" target="_blank" rel="noopener noreferrer">
              Django Admin
            </a>
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

          <article className="profile-card preferences-card">
            <header>
              <h2>Preferences & notifications</h2>
              <p>Fine-tune the reminders and content we prepare just for you.</p>
            </header>
            <ul className="preference-list">
              {Object.entries(profile.preferences).map(([key, preference]) => (
                <li key={key} className="preference-item">
                  <div>
                    <p className="preference-label">{preference.label}</p>
                    <p className="preference-description">{preference.description}</p>
                  </div>
                  <button
                    type="button"
                    className={`switch ${preference.enabled ? 'is-on' : ''}`}
                    onClick={() => handleTogglePreference(key)}
                  >
                    <span className="switch-handle" />
                  </button>
                </li>
              ))}
            </ul>
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

  // Regular User Profile View - Rich UI with all features
  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-identity">
          <div className="avatar-circle">
            <span role="img" aria-label="Paw print">🐾</span>
          </div>
          <div>
            <h1>{profile.name}</h1>
            <p className="profile-hero-subtitle">{profile.bio}</p>
            <div className="profile-contact-line">
              <span>{profile.email}</span>
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
            <span className="badge-value">{profile.loyaltyTier}</span>
            <small>Joined: {formatDate(profile.memberSince)}</small>
          </div>
          <div className="badge">
            <span className="badge-label">Loyalty points</span>
            <span className="badge-value">{profile.points.toLocaleString('en-US')}</span>
            <small>Pet Care Club</small>
          </div>
          <div className="badge">
            <span className="badge-label">Pets supported</span>
            <span className="badge-value">{profile.petsSupported}</span>
            <small>Best friend</small>
          </div>
        </div>
      </section>

      <section className="profile-grid">
        {profile.addresses.length > 0 && (
          <article className="profile-card addresses-card">
            <header>
              <h2>Delivery addresses</h2>
              <p>Manage where your packages go and set your default drop point.</p>
            </header>
            <div className="address-list">
              {profile.addresses.map((address) => (
                <div
                  key={address.id}
                  className={`address-card ${address.isDefault ? 'is-default' : ''}`}
                >
                  <div className="address-header">
                    <span className="address-label">{address.label}</span>
                    {address.isDefault && <span className="address-pill">Default</span>}
                  </div>
                  <p className="address-recipient">{address.recipient}</p>
                  <p className="address-lines">
                    {address.lines && address.lines.length > 0 && address.lines[0] ? (
                      [...address.lines, `${address.postalCode || ''} ${address.city || ''}`].filter(Boolean).join(', ')
                    ) : (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>No address set</span>
                    )}
                  </p>
                  {address.phone && <p className="address-phone">{address.phone}</p>}
                  {address.notes && <p className="address-notes">{address.notes}</p>}
                  {!address.isDefault && (
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => handleSetDefaultAddress(address.id)}
                    >
                      Set as default
                    </button>
                  )}
                </div>
              ))}
            </div>
          </article>
        )}

        {profile.recentOrders.length > 0 && (
          <article className="profile-card orders-card">
            <header>
              <h2>Recent orders</h2>
              <p>Track deliveries and reorder your favourites in one tap.</p>
            </header>
            <div className="order-list">
              {profile.recentOrders.map((order) => (
                <div key={order.id} className="order-item">
                  <div className="order-meta">
                    <span className="order-id">{order.id}</span>
                    <span className={`status-chip status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="order-date">{formatDate(order.date)}</p>
                  <p className="order-total">
                    {order.total.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: order.currency || 'TRY',
                    })}
                  </p>
                  <ul className="order-products">
                    {order.items.map((item, index) => (
                      <li key={`${order.id}-${index}`}>
                        {item.name}
                        <span className="quantity">×{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="order-actions">
                    <button type="button" className="primary-link">
                      View order
                    </button>
                    <button type="button" className="ghost-button">
                      Buy again
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        )}

        <article className="profile-card preferences-card">
          <header>
            <h2>Preferences & notifications</h2>
            <p>Fine-tune the reminders and content we prepare just for you.</p>
          </header>
          <ul className="preference-list">
            {Object.entries(profile.preferences).map(([key, preference]) => (
              <li key={key} className="preference-item">
                <div>
                  <p className="preference-label">{preference.label}</p>
                  <p className="preference-description">{preference.description}</p>
                </div>
                <button
                  type="button"
                  className={`switch ${preference.enabled ? 'is-on' : ''}`}
                  onClick={() => handleTogglePreference(key)}
                >
                  <span className="switch-handle" />
                </button>
              </li>
            ))}
          </ul>
        </article>

        {profile.careNotes.length > 0 && (
          <article className="profile-card care-card">
            <header>
              <h2>Care notes</h2>
              <p>Keep quick notes for your vet and groomer to stay in sync.</p>
            </header>
            <ul className="care-note-list">
              {profile.careNotes.map((note) => (
                <li key={note.id} className="care-note">
                  <div className="care-note-header">
                    <span className="care-note-pet">{note.pet}</span>
                    <span className="care-note-type">{note.type}</span>
                  </div>
                  <p>{note.text}</p>
                </li>
              ))}
            </ul>
          </article>
        )}

        {profile.scheduled.length > 0 && (
          <article className="profile-card schedule-card">
            <header>
              <h2>Upcoming appointments</h2>
              <p>Stay ahead of clinic visits and pamper sessions.</p>
            </header>
            <ul className="schedule-list">
              {profile.scheduled.map((item) => (
                <li key={item.id} className="schedule-item">
                  <div>
                    <p className="schedule-date">
                      {formatDate(item.date)} · {item.time}
                    </p>
                    <p className="schedule-title">{item.title}</p>
                    <p className="schedule-location">{item.location}</p>
                  </div>
                  {item.notes && <p className="schedule-notes">{item.notes}</p>}
                </li>
              ))}
            </ul>
          </article>
        )}

        {profile.favorites.length > 0 && (
          <article className="profile-card favorites-card">
            <header>
              <h2>Favorite products</h2>
              <p>Access your most-loved picks without searching.</p>
            </header>
            <div className="favorites-chip-row">
              {profile.favorites.map((favorite) => (
                <span key={favorite} className="favorite-chip">
                  {favorite}
                </span>
              ))}
            </div>
          </article>
        )}
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
