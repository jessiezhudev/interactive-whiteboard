const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store whiteboard elements and users
let whiteboardElements = [];
const users = new Map();

// Generate random color for user
const getRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Get user info from query params
  const { userId, userName } = socket.handshake.query;
  
  // Create user object
  const user = {
    id: userId,
    name: userName,
    color: getRandomColor(),
    socketId: socket.id
  };
  
  // Store user
  users.set(userId, user);
  
  // Send current state to new user
  socket.emit('syncElements', whiteboardElements);
  socket.emit('syncUsers', Array.from(users.values()));
  
  // Notify other users that a new user joined
  socket.broadcast.emit('userJoined', { user });

  // Handle element added
  socket.on('addElement', (data) => {
    const { element } = data;
    whiteboardElements.push(element);
    
    // Broadcast to all clients except the sender
    socket.broadcast.emit('elementAdded', { element });
  });

  // Handle element updated
  socket.on('updateElement', (data) => {
    const { elementId, updates } = data;
    
    // Find and update the element
    const index = whiteboardElements.findIndex(e => e.id === elementId);
    if (index !== -1) {
      whiteboardElements[index] = { ...whiteboardElements[index], ...updates };
      
      // Broadcast to all clients except the sender
      socket.broadcast.emit('elementUpdated', { elementId, updates });
    }
  });

  // Handle element deleted
  socket.on('deleteElement', (data) => {
    const { elementId } = data;
    
    // Remove the element
    whiteboardElements = whiteboardElements.filter(e => e.id !== elementId);
    
    // Broadcast to all clients
    io.emit('elementDeleted', { elementId });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from map
    users.delete(userId);
    
    // Notify other users
    socket.broadcast.emit('userLeft', { userId });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
