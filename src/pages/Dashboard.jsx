import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Decentralised Auctioning Platform</h1>
        <div className="user-section">
          <span className="user-name">Welcome, {user?.fullName || 'User'}</span>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome to the Auctioning Platform</h2>
          <p>Email: {user?.email}</p>
          <p>Member since: {new Date(user?.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>📋 Browse Auctions</h3>
            <p>View all active auctions and bid on items</p>
          </div>
          <div className="feature-card">
            <h3>🏷️ Create Auction</h3>
            <p>List your own items for auction</p>
          </div>
          <div className="feature-card">
            <h3>💰 My Bids</h3>
            <p>Track your active bids and winning items</p>
          </div>
          <div className="feature-card">
            <h3>👤 Profile</h3>
            <p>Manage your account settings and preferences</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
