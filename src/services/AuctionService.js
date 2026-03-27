import { apiRequest } from './api';

const normalizeAuction = (auction) => ({
  ...auction,
  id: auction._id,
  endTime: new Date(auction.endTime),
  seller: auction.seller?.fullName || auction.seller?.email || 'Unknown seller',
  sellerId: auction.seller?._id,
  highestBidder: auction.highestBidder?.email || null,
  highestBidderId: auction.highestBidder?._id || null,
});

const normalizeBid = (bid) => ({
  id: bid._id,
  bidder: bid.bidder?.fullName || bid.bidder?.email || 'Unknown bidder',
  amount: bid.amount,
  time: new Date(bid.createdAt),
});

export const AuctionService = {
  getAllAuctions: async () => {
    const data = await apiRequest('/auctions', { auth: false });
    return (data?.auctions || []).map(normalizeAuction);
  },

  getAuctionById: async (id) => {
    const data = await apiRequest(`/auctions/${id}`, { auth: false });
    return {
      auction: normalizeAuction(data.auction),
      bidHistory: (data.bidHistory || []).map(normalizeBid),
    };
  },

  getUserAuctions: async (userId) => {
    const data = await apiRequest(`/auctions/user/${userId}`, { auth: false });
    return (data || []).map(normalizeAuction);
  },

  getUserBids: async (userId) => {
    const data = await apiRequest(`/bids/user/${userId}`);
    return (data || []).map(normalizeAuction);
  },

  createAuction: async (auctionData) => {
    const data = await apiRequest('/auctions', {
      method: 'POST',
      body: auctionData,
    });
    return normalizeAuction(data.auction);
  },

  placeBid: async (auctionId, bidAmount) => {
    return apiRequest('/bids', {
      method: 'POST',
      body: {
        auctionId,
        amount: bidAmount,
      },
    });
  },

  isAuctionActive: (endTime, status = 'active') => {
    return status === 'active' && new Date() < new Date(endTime);
  },
};

export default AuctionService;
