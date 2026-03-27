import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Auctions from './pages/Auctions'
import AuctionDetail from './pages/AuctionDetail'
import CreateAuction from './pages/CreateAuction'
import MyBids from './pages/MyBids'
import MyAuctions from './pages/MyAuctions'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import Navigation from './components/Navigation'
import './App.css'

function AppContent() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth()
  const [showSignup, setShowSignup] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedAuctionId, setSelectedAuctionId] = useState(null)

  if (isLoading) {
    return (
      <motion.div
        className="app-loader"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="app-loader-icon"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🏛️
        </motion.div>
        <motion.h2
          className="app-loader-title"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading Marketplace Experience...
        </motion.h2>
      </motion.div>
    )
  }

  if (!isAuthenticated) {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onSwitchToSignup={() => setShowSignup(true)} />
    )
  }

  // Authenticated user - show app with navigation
  const handleNavigate = (page) => {
    setCurrentPage(page)
    setSelectedAuctionId(null)
  }

  const handleSelectAuction = (auctionId) => {
    setSelectedAuctionId(auctionId)
    setCurrentPage('auction-detail')
  }

  const handleCreateSuccess = (newAuction) => {
    setCurrentPage('my-auctions')
    setSelectedAuctionId(null)
  }

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  };

  return (
    <div className="app-shell">
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <main>
        <AnimatePresence mode="wait">
          {currentPage === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              {isAdmin ? (
                <AdminDashboard />
              ) : (
                <UserDashboard onNavigate={handleNavigate} />
              )}
            </motion.div>
          )}
          {selectedAuctionId && currentPage === 'auction-detail' && (
            <motion.div
              key="auction-detail"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <AuctionDetail 
                auctionId={selectedAuctionId} 
                onBack={() => handleNavigate('auctions')}
              />
            </motion.div>
          )}
          {currentPage === 'auctions' && !selectedAuctionId && (
            <motion.div
              key="auctions"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Auctions onSelectAuction={handleSelectAuction} />
            </motion.div>
          )}
          {currentPage === 'create' && (
            <motion.div
              key="create"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <CreateAuction onSuccess={handleCreateSuccess} />
            </motion.div>
          )}
          {currentPage === 'my-auctions' && (
            <motion.div
              key="my-auctions"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <MyAuctions onSelectAuction={handleSelectAuction} />
            </motion.div>
          )}
          {currentPage === 'my-bids' && (
            <motion.div
              key="my-bids"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <MyBids onSelectAuction={handleSelectAuction} />
            </motion.div>
          )}
          {currentPage === 'profile' && (
            <motion.div
              key="profile"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Profile />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
