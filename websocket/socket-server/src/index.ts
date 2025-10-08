import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env or local .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const server = http.createServer(app);

// Get frontend URL from environment or use default for local development
const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

console.log('Allowing CORS for:', frontendUrl);

// CORS configuration
app.use(cors({
  origin: [frontendUrl, 'http://localhost:3000'],
  credentials: true
}));

// Socket.IO configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: [frontendUrl, 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Import models (currently not used but available for future implementation)
// TODO: Implement database operations for messages and conversations
// import HealthProfile from './models/HealthProfile.js';
// import Conversation from './models/Conversation.js';
// import Message from './models/Message.js';

// Store active connections
const userSocketMap = new Map<string, string>();

// Authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify JWT token
    const JWT_SECRET = process.env.JWT_SECRET;
    
    if (!JWT_SECRET) {
      return next(new Error('JWT secret not configured'));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    socket.data.userId = decoded.userId;
    socket.data.user = decoded;
    
    console.log(`🔐 Authenticated user: ${decoded.userId}`);
    next();
  } catch (error) {
    console.error('🔒 Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
});

// Socket event handlers
io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.data.userId);
  
  // Store user-socket mapping
  userSocketMap.set(socket.data.userId, socket.id);

  // Join user to their personal room
  socket.join(`user:${socket.data.userId}`);

  // Join conversation
  socket.on('join_conversation', async (conversationId: string) => {
    socket.join(conversationId);
    console.log(`💬 User ${socket.data.userId} joined conversation ${conversationId}`);
  });

  // Send message
  socket.on('send_message', async (data: {
    conversationId: string;
    content: string;
    type: string;
    fileUrl?: string;
  }) => {
    try {
      console.log('📨 New message:', data);
      
      // Create message (you'll need to implement your Message model)
      // For now, just broadcast to conversation
      socket.to(data.conversationId).emit('new_message', {
        ...data,
        sender: socket.data.userId,
        timestamp: new Date()
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Audio call events (simplified for now)
  socket.on('audio_call_initiate', (data) => {
    console.log('📞 Audio call initiated:', data);
    socket.to(data.conversationId).emit('audio_call_incoming', {
      ...data,
      caller: socket.data.userId
    });
  });

  socket.on('audio_call_answer', (data) => {
    socket.to(data.conversationId).emit('audio_call_answered', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.data.userId);
    userSocketMap.delete(socket.data.userId);
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    connectedUsers: userSocketMap.size,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({ 
    message: 'HealthConnect Socket Server',
    version: '1.0.0',
    status: 'running'
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Socket server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${frontendUrl}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});