import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import '../styles/Navigation.css';

function Navigation({ currentPage, onNavigate }) {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('dashboard');
  };

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  const linkVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  const navItems = isAdmin
    ? [
        { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { key: 'auctions', label: 'Auctions', icon: '🔍' },
        { key: 'profile', label: 'Profile', icon: '👤' }
      ]
    : [
        { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
        { key: 'auctions', label: 'Auctions', icon: '🔍' },
        { key: 'my-auctions', label: 'My Auctions', icon: '📦' },
        { key: 'my-bids', label: 'My Bids', icon: '💰' },
        { key: 'create', label: 'Create', icon: '➕' },
        { key: 'profile', label: 'Profile', icon: '👤' }
      ];

  return (
    <motion.nav 
      className="navbar"
      initial="hidden"
      animate="visible"
      variants={navVariants}
    >
      <div className="nav-container">
        <motion.div 
          className="logo" 
          onClick={() => onNavigate('dashboard')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🏛️ Auction Nexus
        </motion.div>

        <ul className="nav-menu">
          {navItems.map((item) => (
            <li key={item.key}>
              <motion.button
                className={`nav-link ${currentPage === item.key ? 'active' : ''}`}
                onClick={() => onNavigate(item.key)}
                variants={linkVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </motion.button>
            </li>
          ))}
        </ul>

        <div className="nav-user">
          <span className={`user-role-badge ${isAdmin ? 'admin' : 'user'}`}>
            {isAdmin ? 'Admin' : 'User'}
          </span>
          <motion.span 
            className="user-email"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {user?.fullName}
          </motion.span>
          <motion.button 
            className="logout-btn" 
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navigation;
