import { useState, useEffect } from 'react';
import { AuctionService } from '../services/AuctionService';
import { useAuth } from '../context/AuthContext';
import '../styles/MyBids.css';

function MyBids({ onSelectAuction }) {
  const [bids, setBids] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadUserBids = async () => {
      if (!user?._id) return;

      try {
        const userBids = await AuctionService.getUserBids(user._id);
        setBids(userBids);
      } catch {
        setBids([]);
      }
    };

    loadUserBids();
  }, [user?._id]);

  const formatTime = (date) => {
    const now = new Date();
    const diff = date - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    if (hours > 0) return `${hours}h ${mins}m remaining`;
    if (mins > 0) return `${mins}m remaining`;
    return 'Ended';
  };

  return (
    <div className="my-bids-container">
      <div className="page-header">
        <h1>💰 My Bids</h1>
        <p>Track your active bids and winning items</p>
      </div>

      {bids.length > 0 ? (
        <div className="bids-table">
          <div className="table-header">
            <div className="col col-item">Item</div>
            <div className="col col-bid">Your Bid</div>
            <div className="col col-current">Current Bid</div>
            <div className="col col-status">Status</div>
            <div className="col col-time">Time Left</div>
            <div className="col col-action">Action</div>
          </div>

          {bids.map((bid) => {
            const isWinning = bid.highestBidderId === user._id;
            const isActive = AuctionService.isAuctionActive(bid.endTime, bid.status);

            return (
              <div key={bid.id} className="table-row">
                <div className="col col-item">
                  <span className="item-icon">{bid.image}</span>
                  <span className="item-title">{bid.title}</span>
                </div>
                <div className="col col-bid">₹{bid.currentBid}</div>
                <div className="col col-current">₹{bid.currentBid}</div>
                <div className="col col-status">
                  <span className={`status-badge ${isWinning ? 'winning' : 'bidding'}`}>
                    {isWinning ? '✓ Winning' : '• Bidding'}
                  </span>
                </div>
                <div className="col col-time">{formatTime(bid.endTime)}</div>
                <div className="col col-action">
                  <button
                    className="view-btn"
                    onClick={() => onSelectAuction(bid.id)}
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
          <p>💭 You haven't placed any bids yet</p>
          <p>Browse auctions and place your first bid!</p>
        </div>
      )}
    </div>
  );
}

export default MyBids;
