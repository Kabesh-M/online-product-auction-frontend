import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuctionService } from '../services/AuctionService';
import ParticleBackground from '../components/ParticleBackground';
import '../styles/Auctions.css';

function Auctions({ onSelectAuction }) {
  const [auctions, setAuctions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadAuctions = async () => {
      try {
        const data = await AuctionService.getAllAuctions();
        setAuctions(data);
      } catch {
        setAuctions([]);
      }
    };

    loadAuctions();
  }, []);

  const filteredAuctions = auctions.filter((auction) => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && AuctionService.isAuctionActive(auction.endTime, auction.status);
    if (filter === 'ending-soon') {
      const hoursLeft = (new Date(auction.endTime) - new Date()) / (1000 * 60 * 60);
      return matchesSearch && hoursLeft < 24 && hoursLeft > 0;
    }
    return matchesSearch;
  });

  const formatTime = (dateValue) => {
    const date = new Date(dateValue);
    const now = new Date();
    const diff = date - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m`;
    return 'Ended';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
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

  return (
    <div className="auctions-page">
      <ParticleBackground density={25} />

      <motion.div
        className="auctions-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="auctions-header" variants={itemVariants}>
          <h1>🏛️ Active Auctions</h1>
          <p className="header-subtitle">Browse and bid on amazing items</p>
        </motion.div>

        <motion.div className="auctions-controls glass-card" variants={itemVariants}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search auctions by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            {[
              { value: 'all', label: 'All Auctions', icon: '📋' },
              { value: 'active', label: 'Active', icon: '🟢' },
              { value: 'ending-soon', label: 'Ending Soon', icon: '⏰' }
            ].map(({ value, label, icon }) => (
              <motion.button
                key={value}
                className={`filter-btn ${filter === value ? 'active' : ''}`}
                onClick={() => setFilter(value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="btn-icon">{icon}</span>
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            className="auctions-grid"
            key={filter + searchTerm}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredAuctions.length > 0 ? (
              filteredAuctions.map((auction) => {
                const isActive = AuctionService.isAuctionActive(auction.endTime, auction.status);
                return (
                  <motion.div
                    key={auction.id}
                    className="auction-card glass-card"
                    variants={itemVariants}
                    onClick={() => onSelectAuction(auction.id)}
                    whileHover={{ scale: 1.03, y: -8 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className={`auction-status ${isActive ? 'live' : 'ended'}`}>
                      {isActive ? '🟢 LIVE' : '⚫ ENDED'}
                    </div>
                    <div className="auction-image">
                      <div className="image-placeholder">{auction.image}</div>
                    </div>
                    <div className="auction-content">
                      <h3 className="auction-title">{auction.title}</h3>
                      <p className="auction-category">
                        <span className="category-icon">🏷️</span>
                        {auction.category}
                      </p>
                      <div className="auction-stats">
                        <div className="stat-item">
                          <span className="stat-label">Current Bid</span>
                          <span className="stat-value">${auction.currentBid}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Total Bids</span>
                          <span className="stat-value">{auction.bids}</span>
                        </div>
                      </div>
                      <div className="auction-footer">
                        <div className={`auction-time ${isActive ? 'active' : 'ended'}`}>
                          <span className="time-icon">⏱️</span>
                          <span className="time-text">{formatTime(auction.endTime)}</span>
                        </div>
                        <motion.button
                          className="view-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAuction(auction.id);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          View →
                        </motion.button>
                      </div>
                    </div>
                    <div className="card-glow"></div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                className="no-results glass-card"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="empty-icon">📭</div>
                <h3>No auctions found</h3>
                <p>Try adjusting your search or filters</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default Auctions;
