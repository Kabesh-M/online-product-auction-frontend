import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ParticleBackground from '../components/ParticleBackground';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAuctions: 0,
    activeAuctions: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalBids: 0
  });
  const [auctions, setAuctions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const allAuctions = JSON.parse(localStorage.getItem('auctions') || '[]');
    const bids = JSON.parse(localStorage.getItem('bids') || '[]');
    
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    
    const activeAuctions = allAuctions.filter(a => new Date(a.endTime) > new Date());
    const todayBids = bids.filter(b => new Date(b.timestamp) >= todayStart);
    const totalRevenue = bids.reduce((sum, bid) => sum + bid.amount, 0);
    const todayRevenue = todayBids.reduce((sum, bid) => sum + bid.amount, 0);

    setStats({
      totalUsers: users.length,
      totalAuctions: allAuctions.length,
      activeAuctions: activeAuctions.length,
      totalRevenue,
      todayRevenue,
      totalBids: bids.length
    });

    setAuctions(allAuctions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const deleteAuction = (auctionId) => {
    if (window.confirm('Are you sure you want to delete this auction?')) {
      const allAuctions = JSON.parse(localStorage.getItem('auctions') || '[]');
      const updatedAuctions = allAuctions.filter(a => a.id !== auctionId);
      localStorage.setItem('auctions', JSON.stringify(updatedAuctions));
      
      // Also remove related bids
      const bids = JSON.parse(localStorage.getItem('bids') || '[]');
      const updatedBids = bids.filter(b => b.auctionId !== auctionId);
      localStorage.setItem('bids', JSON.stringify(updatedBids));
      
      loadAdminStats();
      addToast('Auction deleted successfully', 'success');
    }
  };

  const getRevenueData = () => {
    const bids = JSON.parse(localStorage.getItem('bids') || '[]');
    const now = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const dayBids = bids.filter(b => {
        const bidDate = new Date(b.timestamp);
        return bidDate >= date && bidDate < nextDay;
      });
      
      const revenue = dayBids.reduce((sum, bid) => sum + bid.amount, 0);
      data.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue
      });
    }
    
    return data;
  };

  const revenueData = getRevenueData();
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      change: '+12%'
    },
    {
      title: 'Active Auctions',
      value: stats.activeAuctions,
      icon: '🔥',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      change: '+8%'
    },
    {
      title: 'Total Bids',
      value: stats.totalBids,
      icon: '💰',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      change: '+23%'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: '📈',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      change: '+15%'
    }
  ];

  return (
    <div className="admin-dashboard">
      <ParticleBackground density={30} />
      
      <motion.div
        className="admin-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="admin-header" variants={itemVariants}>
          <div className="header-content">
            <div>
              <h1>Admin Dashboard</h1>
              <p className="header-subtitle">Welcome back, {user?.fullName}</p>
            </div>
            <div className="header-actions">
              <motion.button 
                className="refresh-btn"
                onClick={loadAdminStats}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 Refresh
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div className="stats-grid" variants={itemVariants}>
          {statCards.map((card, index) => (
            <motion.div
              key={index}
              className="stat-card glass-card"
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="stat-icon" style={{ background: card.gradient }}>
                {card.icon}
              </div>
              <div className="stat-content">
                <h3 className="stat-title">{card.title}</h3>
                <div className="stat-value">{card.value}</div>
                <div className="stat-change positive">{card.change} from last month</div>
              </div>
              <div className="stat-glow" style={{ background: card.gradient }}></div>
            </motion.div>
          ))}
        </motion.div>

        {/* Revenue Chart */}
        <motion.div className="chart-section glass-card" variants={itemVariants}>
          <div className="chart-header">
            <h2>Revenue Overview</h2>
            <div className="period-selector">
              {['week', 'month', 'year'].map(period => (
                <button
                  key={period}
                  className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-container">
            <div className="chart-bars">
              {revenueData.map((data, index) => (
                <motion.div
                  key={index}
                  className="chart-bar-wrapper"
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div
                    className="chart-bar"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: index * 0.1, type: 'spring' }}
                    style={{ height: `${(data.revenue / maxRevenue) * 120}px` }}
                  >
                    <div className="bar-value">${data.revenue}</div>
                  </motion.div>
                  <div className="bar-label">{data.day}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div className="tabs-section" variants={itemVariants}>
          <div className="tabs-header">
            {['overview', 'auctions', 'users'].map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            <motion.div
              className="tab-indicator"
              layoutId="tabIndicator"
              initial={false}
            />
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'auctions' && (
              <motion.div
                key="auctions"
                className="tab-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="auctions-grid">
                  {auctions.map((auction) => {
                    const isActive = new Date(auction.endTime) > new Date();
                    return (
                      <motion.div
                        key={auction.id}
                        className="auction-card glass-card"
                        whileHover={{ scale: 1.03, y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <div className={`auction-status ${isActive ? 'active' : 'ended'}`}>
                          {isActive ? '🟢 LIVE' : '⚫ ENDED'}
                        </div>
                        <div className="auction-image">
                          <img src={auction.image || 'https://via.placeholder.com/300x200'} alt={auction.title} />
                        </div>
                        <div className="auction-info">
                          <h3>{auction.title}</h3>
                          <p className="auction-description">{auction.description}</p>
                          <div className="auction-meta">
                            <div className="meta-item">
                              <span className="meta-label">Starting Bid</span>
                              <span className="meta-value">${auction.startingBid}</span>
                            </div>
                            <div className="meta-item">
                              <span className="meta-label">Created</span>
                              <span className="meta-value">
                                {new Date(auction.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <motion.button
                            className="delete-btn"
                            onClick={() => deleteAuction(auction.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            🗑️ Delete
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                className="tab-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="overview-content glass-card">
                  <h3>Platform Overview</h3>
                  <div className="overview-stats">
                    <div className="overview-item">
                      <span className="overview-label">Today's Revenue</span>
                      <span className="overview-value">${stats.todayRevenue.toLocaleString()}</span>
                    </div>
                    <div className="overview-item">
                      <span className="overview-label">Total Auctions</span>
                      <span className="overview-value">{stats.totalAuctions}</span>
                    </div>
                    <div className="overview-item">
                      <span className="overview-label">Avg Bid Value</span>
                      <span className="overview-value">
                        ${stats.totalBids > 0 ? Math.round(stats.totalRevenue / stats.totalBids) : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                className="tab-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="users-content glass-card">
                  <h3>User Management</h3>
                  <p>User management features coming soon...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default AdminDashboard;
