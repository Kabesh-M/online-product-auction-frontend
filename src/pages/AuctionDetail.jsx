import { useState, useEffect } from 'react';
import { AuctionService } from '../services/AuctionService';
import '../styles/AuctionDetail.css';

function AuctionDetail({ auctionId, onBack }) {
  const [auction, setAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bidHistory, setBidHistory] = useState([]);

  useEffect(() => {
    const loadAuction = async () => {
      try {
        const data = await AuctionService.getAuctionById(auctionId);
        setAuction(data.auction);
        setBidHistory(data.bidHistory || []);
      } catch (err) {
        setError(err.message);
      }
    };

    loadAuction();
  }, [auctionId]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const amount = parseFloat(bidAmount);
    if (!amount || amount <= auction.currentBid) {
      setError(`Bid must be higher than ₹${auction.currentBid}`);
      return;
    }

    try {
      await AuctionService.placeBid(auction.id, amount);
      const updated = await AuctionService.getAuctionById(auction.id);
      setAuction(updated.auction);
      setBidHistory(updated.bidHistory || []);
      setBidAmount('');
      setSuccess('Bid placed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!auction) {
    return <div className="loading">Loading...</div>;
  }

  const isActive = AuctionService.isAuctionActive(auction.endTime, auction.status);
  const timeLeft = new Date(auction.endTime) - new Date();
  const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="auction-detail">
      <button className="back-button" onClick={onBack}>
        ← Back to Auctions
      </button>

      <div className="detail-container">
        <div className="detail-image-section">
          <div className="large-image">{auction.image}</div>
        </div>

        <div className="detail-info-section">
          <h1>{auction.title}</h1>
          <p className="category-badge">{auction.category}</p>
          <p className="description">{auction.description}</p>

          <div className="detail-stats">
            <div className="stat-box">
              <span className="stat-label">Current Bid</span>
              <span className="stat-value">₹{auction.currentBid}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Starting Price</span>
              <span className="stat-value">₹{auction.startingPrice}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Total Bids</span>
              <span className="stat-value">{auction.bids}</span>
            </div>
          </div>

          <div className={`time-remaining ${isActive ? 'active' : 'ended'}`}>
            <h3>Time Remaining</h3>
            {isActive ? (
              <p>
                {daysLeft}d {hoursLeft}h {minutesLeft}m
              </p>
            ) : (
              <p>Auction Ended</p>
            )}
          </div>

          {isActive && (
            <div className="bidding-section">
              <h3>Place Your Bid</h3>
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <form onSubmit={handlePlaceBid}>
                <div className="form-group">
                  <label>Bid Amount (INR)</label>
                  <input
                    type="number"
                    min={auction.currentBid + 1}
                    step="1"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Minimum: ₹${auction.currentBid + 1}`}
                    required
                  />
                </div>
                <button type="submit" className="bid-button">
                  Place Bid
                </button>
              </form>
            </div>
          )}

          <div className="seller-info">
            <span>Seller: <strong>{auction.seller}</strong></span>
            {auction.highestBidder && (
              <span>Leading Bidder: <strong>{auction.highestBidder}</strong></span>
            )}
          </div>
        </div>
      </div>

      <div className="bid-history">
        <h2>Bid History</h2>
        {bidHistory.length > 0 ? (
          <div className="history-list">
            {bidHistory.map((bid) => (
              <div key={bid.id} className="history-item">
                <div className="history-bidder">{bid.bidder}</div>
                <div className="history-amount">₹{bid.amount}</div>
                <div className="history-time">
                  {new Date(bid.time).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-bids">No bids yet. Be the first to bid!</p>
        )}
      </div>
    </div>
  );
}

export default AuctionDetail;
