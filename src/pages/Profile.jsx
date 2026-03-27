import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';

function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile');
    }
  };

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : 'Unknown';

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>👤 My Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <span className="avatar-emoji">👤</span>
          </div>

          <div className="profile-info">
            <h2>{user?.fullName}</h2>
            <p className="member-info">Member since {memberSince}</p>

            {message && (
              <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            {!isEditing ? (
              <div className="profile-details">
                <div className="detail-group">
                  <label>Full Name</label>
                  <p>{user?.fullName}</p>
                </div>
                <div className="detail-group">
                  <label>Email</label>
                  <p>{user?.email}</p>
                </div>
                <div className="detail-group">
                  <label>Phone</label>
                  <p>{user?.phone || 'Not provided'}</p>
                </div>
                <div className="detail-group">
                  <label>Address</label>
                  <p>{user?.address || 'Not provided'}</p>
                </div>
                <div className="detail-group">
                  <label>Bio</label>
                  <p>{user?.bio || 'Not provided'}</p>
                </div>

                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  ✏️ Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="edit-form">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    id="address"
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself"
                    rows="4"
                  ></textarea>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="save-btn">
                    💾 Save Changes
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="stats-section">
          <h3>Account Statistics</h3>
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-icon">📦</span>
              <span className="stat-label">Auctions Created</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-box">
              <span className="stat-icon">💰</span>
              <span className="stat-label">Active Bids</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-box">
              <span className="stat-icon">🏆</span>
              <span className="stat-label">Auctions Won</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-box">
              <span className="stat-icon">⭐</span>
              <span className="stat-label">Rating</span>
              <span className="stat-value">N/A</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
