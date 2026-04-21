import React, { useState, useEffect } from 'react';
import { storeAPI } from '../services/api';
import '../styles/StoreSetup.css';

function StoreSetup({ user, onStoreCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    hours: '',
  });
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchStore();
  }, []);

  const fetchStore = async () => {
    try {
      const response = await storeAPI.getMyStore();
      setStore(response.data);
      setFormData({
        name: response.data.name,
        description: response.data.description || '',
        location: response.data.location || '',
        hours: response.data.hours || '',
      });
    } catch (err) {
      // Store doesn't exist yet, that's fine
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (store) {
        // Update existing store
        const response = await storeAPI.updateStore(
          formData.name,
          formData.description,
          formData.location,
          formData.hours,
          'active'
        );
        setStore(response.data);
        setIsEditing(false);
      } else {
        // Create new store
        const response = await storeAPI.createStore(
          formData.name,
          formData.description,
          formData.location,
          formData.hours
        );
        setStore(response.data);
        onStoreCreated(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!store && !isEditing) {
    return (
      <div className="store-setup-container">
        <div className="store-setup-box">
          <h2>Create Your Store</h2>
          <p>Set up your food store to start taking orders</p>
          <button onClick={() => setIsEditing(true)} className="btn-primary">
            Create Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="store-setup-container">
      <div className="store-setup-box">
        {store && !isEditing ? (
          <>
            <h2>Store Information</h2>
            <div className="store-info">
              <p><strong>Name:</strong> {store.name}</p>
              <p><strong>Description:</strong> {store.description}</p>
              <p><strong>Location:</strong> {store.location}</p>
              <p><strong>Hours:</strong> {store.hours}</p>
              <button onClick={() => setIsEditing(true)} className="btn-primary">
                Edit Store
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>{store ? 'Edit Store' : 'Create Store'}</h2>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Store Name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <textarea
                name="description"
                placeholder="Store Description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
              />

              <input
                type="text"
                name="location"
                placeholder="Store Location"
                value={formData.location}
                onChange={handleChange}
              />

              <input
                type="text"
                name="hours"
                placeholder="Store Hours (e.g., 10 AM - 4 PM)"
                value={formData.hours}
                onChange={handleChange}
              />

              <div className="button-group">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : store ? 'Update Store' : 'Create Store'}
                </button>
                {store && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default StoreSetup;
