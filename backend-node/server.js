require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Make io accessible to routes
app.set('io', io);

// Basic Route
app.get('/', (req, res) => {
  res.send('ITSM Node Backend API is running...');
});

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/technician-subscriptions', require('./routes/technicianSubscriptionRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

const PORT = process.env.PORT || 8081; // Using 8081 to match frontend's default
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
