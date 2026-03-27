import { useState } from 'react';
import { AuctionService } from '../services/AuctionService';
import '../styles/CreateAuction.css';

function CreateAuction({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    startingPrice: '',
    duration: 7,
    image: '📦',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Electronics', 'Jewelry', 'Books', 'Sports', 'Music', 'Art', 'Other'];
  const images = ['📦', '📷', '⌚', '💿', '⚾', '📚', '🎮', '🎨', '🎵', '💍'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.startingPrice || parseFloat(formData.startingPrice) <= 0) {
      setError('Starting price must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      const endTime = new Date(Date.now() + Number(formData.duration) * 24 * 60 * 60 * 1000).toISOString();

      const newAuction = await AuctionService.createAuction({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        startingPrice: parseFloat(formData.startingPrice),
        endTime,
        image: formData.image,
      });

      setFormData({
        title: '',
        description: '',
        category: 'Electronics',
        startingPrice: '',
        duration: 7,
        image: '📦',
      });

      onSuccess(newAuction);
    } catch (err) {
      setError(err.message || 'Failed to create auction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-auction-container">
      <div className="create-auction-header">
        <h1>➕ Create New Auction</h1>
        <p>List your item for sale and start receiving bids</p>
      </div>

      <form onSubmit={handleSubmit} className="create-auction-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-section">
          <h2>Item Details</h2>

          <div className="form-group">
            <label htmlFor="image">Item Icon</label>
            <div className="image-selector">
              {images.map((img) => (
                <button
                  key={img}
                  type="button"
                  className={`image-option ${formData.image === img ? 'selected' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, image: img }))}
                >
                  <span className="image-emoji">{img}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">Item Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a descriptive title for your item"
              maxLength="100"
              required
              disabled={loading}
            />
            <small>{formData.title.length}/100</small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the condition, features, and details of your item"
              rows="5"
              maxLength="500"
              required
              disabled={loading}
            ></textarea>
            <small>{formData.description.length}/500</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={loading}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="startingPrice">Starting Price (₹) *</label>
              <input
                id="startingPrice"
                type="number"
                name="startingPrice"
                value={formData.startingPrice}
                onChange={handleChange}
                placeholder="0"
                min="0.01"
                step="1"
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Auction Duration</h2>

          <div className="form-group">
            <label htmlFor="duration">Duration (Days)</label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="1">1 Day</option>
              <option value="3">3 Days</option>
              <option value="7">7 Days</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
            </select>
          </div>

          <div className="duration-info">
            <p>Your auction will end on: <strong>
              {new Date(Date.now() + formData.duration * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </strong></p>
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Creating Auction...' : 'Create Auction'}
        </button>
      </form>
    </div>
  );
}

export default CreateAuction;
