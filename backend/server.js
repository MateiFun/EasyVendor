const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const { initializeDatabase } = require('./config/database');

dotenv.config(); // Force reload of environment variables

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const storeRoutes = require('./routes/stores');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Socket.io connection for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join store room for real-time order updates
  socket.on('join-store', (storeId) => {
    socket.join(`store-${storeId}`);
    console.log(`Client joined store room: store-${storeId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await initializeDatabase();
    console.log('✓ Database initialized');
    
    server.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, io };
