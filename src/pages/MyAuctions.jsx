import { useState, useEffect } from 'react';
import { AuctionService } from '../services/AuctionService';
import { useAuth } from '../context/AuthContext';
import '../styles/MyAuctions.css';

function MyAuctions({ onSelectAuction }) {
  const [auctions, setAuctions] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadUserAuctions = async () => {
      if (!user?._id) return;

      try {
        const userAuctions = await AuctionService.getUserAuctions(user._id);
        setAuctions(userAuctions);
      } catch {
        setAuctions([]);
      }
    };

    loadUserAuctions();
  }, [user?._id]);

  const formatTime = (date) => {
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

  return (
    <div className="my-auctions-container">
      <div className="page-header">
        <h1>📦 My Auctions</h1>
        <p>Manage and monitor your active auctions</p>
      </div>

      {auctions.length > 0 ? (
        <div className="auctions-table">
          <div className="table-header">
            <div className="col col-item">Item</div>
            <div className="col col-current">Current Bid</div>
            <div className="col col-bids">Bids</div>
            <div className="col col-status">Status</div>
            <div className="col col-time">Ends In</div>
            <div className="col col-action">Action</div>
          </div>

          {auctions.map((auction) => {
            const isActive = AuctionService.isAuctionActive(auction.endTime, auction.status);

            return (
              <div key={auction.id} className="table-row">
                <div className="col col-item">
                  <span className="item-icon">{auction.image}</span>
                  <span className="item-title">{auction.title}</span>
                </div>
                <div className="col col-current">₹{auction.currentBid}</div>
                <div className="col col-bids">{auction.bids}</div>
                <div className="col col-status">
                  <span className={`status-badge ${isActive ? 'active' : 'ended'}`}>
                    {isActive ? '🟢 Active' : '🔴 Ended'}
                  </span>
                </div>
                <div className="col col-time">
                  {isActive ? formatTime(auction.endTime) : 'Ended'}
                </div>
                <div className="col col-action">
                  <button
                    className="view-btn"
                    onClick={() => onSelectAuction(auction.id)}
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <p>📭 You haven't created any auctions yet</p>
          <p>Start selling by creating your first auction!</p>
        </div>
      )}
    </div>
  );
}

export default MyAuctions;
