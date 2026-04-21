import React, { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './pages/LoginPage';
import StoreSetup from './pages/StoreSetup';

function App() {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setStore(null);
  };

  const handleStoreCreated = (storeData) => {
    setStore(storeData);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🍔 EasyVendor Store Dashboard</h1>
          <div className="user-section">
            <span>Welcome, {user.name}!</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <StoreSetup user={user} onStoreCreated={handleStoreCreated} />
      </main>
    </div>
  );
}

export default App;
