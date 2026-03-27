import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import ParticleBackground from '../components/ParticleBackground';
import '../styles/UserDashboard.css';

function UserDashboard({ onNavigate }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [userStats, setUserStats] = useState({
    activeAuctions: 0,
    activeBids: 0,
    wonAuctions: 0,
    totalSpent: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadUserStats();
    loadRecentActivity();
  }, [user]);

  const loadUserStats = () => {
    // Load user's auctions
    const auctions = JSON.parse(localStorage.getItem('auctions') || '[]');
    const userAuctions = auctions.filter(a => a.userId === user?.id);
    const activeAuctions = userAuctions.filter(a => new Date(a.endTime) > new Date()).length;

    // Load user's bids
    const bids = JSON.parse(localStorage.getItem('bids') || '[]');
    const userBids = bids.filter(b => b.userId === user?.id);
    
    // Calculate active bids (auctions still running)
    const activeBids = userBids.filter(bid => {
      const auction = auctions.find(a => a.id === bid.auctionId);
      return auction && new Date(auction.endTime) > new Date();
    }).length;

    // Calculate won auctions (highest bid and auction ended)
    const wonAuctions = userBids.filter(bid => {
      const auction = auctions.find(a => a.id === bid.auctionId);
      if (!auction || new Date(auction.endTime) > new Date()) return false;
      
      const auctionBids = userBids.filter(b => b.auctionId === bid.auctionId);
      const highestBid = Math.max(...auctionBids.map(b => b.amount));
      return bid.amount === highestBid;
    }).length;

    // Calculate total spent
    const totalSpent = userBids.reduce((sum, bid) => sum + bid.amount, 0);

    setUserStats({
      activeAuctions,
      activeBids,
      wonAuctions,
      totalSpent
    });
  };

  const loadRecentActivity = () => {
    const bids = JSON.parse(localStorage.getItem('bids') || '[]');
    const userBids = bids.filter(b => b.userId === user?.id);
    const recentBids = userBids.slice(-5).reverse();

    const auctions = JSON.parse(localStorage.getItem('auctions') || '[]');
    
    const activity = recentBids.map(bid => {
      const auction = auctions.find(a => a.id === bid.auctionId);
      return {
        ...bid,
        auctionTitle: auction?.title || 'Unknown Auction',
        timestamp: bid.timestamp || new Date().toISOString()
      };
    });

    setRecentActivity(activity);
  };

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
      transition: { duration: 0.5 }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const statCards = [
    {
      title: 'My Active Auctions',
      value: userStats.activeAuctions,
      icon: '🏷️',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Currently listed items'
    },
    {
      title: 'Active Bids',
      value: userStats.activeBids,
      icon: '💵',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      description: 'Ongoing bidding activity'
    },
    {
      title: 'Won Auctions',
      value: userStats.wonAuctions,
      icon: '🏆',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      description: 'Successfully won items'
    },
    {
      title: 'Total Spent',
      value: `$${userStats.totalSpent.toLocaleString()}`,
      icon: '💰',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Total bidding amount'
    }
  ];

  return (
    <div className="user-dashboard">
      <ParticleBackground density={30} />
      
      <motion.div 
        className="user-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="user-header" variants={itemVariants}>
          <div className="header-content">
            <div>
              <h1>My Dashboard</h1>
              <p className="header-subtitle">Welcome back, {user?.fullName}!</p>
            </div>
            <motion.button
              className="refresh-btn"
              onClick={() => {
                loadUserStats();
                loadRecentActivity();
                addToast('Dashboard refreshed', 'success');
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Refresh
            </motion.button>
          </div>
        </motion.div>

        <motion.div className="user-stats-grid" variants={containerVariants}>
          {statCards.map((card, index) => (
            <motion.div
              key={index}
              className="user-stat-card glass-card"
              variants={cardVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="stat-icon-wrapper" style={{ background: card.gradient }}>
                <span className="stat-icon">{card.icon}</span>
              </div>
              <div className="stat-info">
                <h3 className="stat-value">{card.value}</h3>
                <p className="stat-title">{card.title}</p>
                <p className="stat-description">{card.description}</p>
              </div>
              <div className="stat-glow" style={{ background: card.gradient }}></div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="dashboard-content" variants={containerVariants}>
          <motion.section className="dashboard-section glass-card" variants={itemVariants}>
            <div className="section-header">
              <h2>Recent Activity</h2>
              <span className="activity-count">{recentActivity.length} activities</span>
            </div>
            <div className="activity-list">
              {recentActivity.length === 0 ? (
                <motion.div 
                  className="no-activity"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="empty-state-icon">📭</div>
                  <p>No recent activity</p>
                  <motion.button 
                    className="browse-btn"
                    onClick={() => onNavigate && onNavigate('auctions')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Browse Auctions
                  </motion.button>
                </motion.div>
              ) : (
                recentActivity.map((activity, index) => (
                  <motion.div 
                    key={index} 
                    className="activity-item"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 10, scale: 1.02 }}
                  >
                    <div className="activity-icon-bg">
                      <span className="activity-icon">💵</span>
                    </div>
                    <div className="activity-details">
                      <h4>Bid placed on "{activity.auctionTitle}"</h4>
                      <p className="activity-amount">Amount: ${activity.amount.toLocaleString()}</p>
                      <span className="activity-time">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>

          <motion.section className="dashboard-section glass-card" variants={itemVariants}>
            <div className="section-header">
              <h2>Quick Actions</h2>
              <span className="action-hint">Choose an action</span>
            </div>
            <div className="quick-action-grid">
              <motion.button 
                className="quick-action-card"
                onClick={() => onNavigate && onNavigate('auctions')}
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="qa-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>🔍</span>
                <span className="qa-title">Browse Auctions</span>
                <span className="qa-description">Find items to bid on</span>
              </motion.button>
              <motion.button 
                className="quick-action-card"
                onClick={() => onNavigate && onNavigate('create')}
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="qa-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>➕</span>
                <span className="qa-title">Create Auction</span>
                <span className="qa-description">List a new item</span>
              </motion.button>
              <motion.button 
                className="quick-action-card"
                onClick={() => onNavigate && onNavigate('my-bids')}
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="qa-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>📊</span>
                <span className="qa-title">My Bids</span>
                <span className="qa-description">Track your bids</span>
              </motion.button>
              <motion.button 
                className="quick-action-card"
                onClick={() => onNavigate && onNavigate('my-auctions')}
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="qa-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>📦</span>
                <span className="qa-title">My Auctions</span>
                <span className="qa-description">Manage your listings</span>
              </motion.button>
            </div>
          </motion.section>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default UserDashboard;
