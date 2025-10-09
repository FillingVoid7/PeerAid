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
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Import models from main application
import { Message, IMessage } from '../../../models/message';
import { Conversation, IConversation } from '../../../models/chatConversation';
import { AudioCall, IAudioCall } from '../../../models/audioCall';
import User from '../../../models/User';

const app = express();
const server = http.createServer(app);

// Add JSON middleware
app.use(express.json());

// Get frontend URL from environment or use default for local development
const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

console.log('🌐 Allowing CORS for:', frontendUrl);

// CORS configuration
app.use(cors({
  origin: [frontendUrl, 'http://localhost:3000', 'https://peer-aid.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Socket.IO configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: [frontendUrl, 'http://localhost:3000', 'https://peer-aid.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Store active connections and conversation rooms
const userSocketMap = new Map<string, string>();
const conversationRooms = new Map<string, Set<string>>();

// Interfaces for socket events
interface JoinConversationData {
  conversationId: string;
}

interface SendMessageData {
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'system' | 'audio_invite' | 'audio_accept' | 'audio_reject';
  fileUrl?: string;
  duration?: number;
  audioCallId?: string;
}

interface AudioCallData {
  conversationId: string;
  callId: string;
  type: 'initiate' | 'answer' | 'reject' | 'end';
  offer?: any;
  answer?: any;
  iceCandidate?: any;
}

interface TypingData {
  conversationId: string;
  isTyping: boolean;
}

// Authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify JWT token
    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    
    if (!JWT_SECRET) {
      return next(new Error('JWT secret not configured'));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    socket.data.userId = decoded.userId || decoded.id || decoded.sub;
    socket.data.user = decoded;
    
    console.log(`🔐 Authenticated user: ${socket.data.userId}`);
    next();
  } catch (error) {
    console.error('🔒 Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
});

// Socket event handlers
io.on('connection', (socket) => {
  const userId = socket.data.userId;
  console.log(`🟢 User connected: ${userId} (Socket: ${socket.id})`);
  
  // Store user-socket mapping
  userSocketMap.set(userId, socket.id);

  // Join user to their personal room for notifications
  socket.join(`user:${userId}`);

  // Handle joining a conversation
  socket.on('join_conversation', async (data: JoinConversationData) => {
    try {
      const { conversationId } = data;
      
      // Verify user is part of this conversation
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      const isParticipant = conversation.participants.seeker.toString() === userId || 
                           conversation.participants.guide.toString() === userId;
      
      if (!isParticipant) {
        socket.emit('error', { message: 'Unauthorized to join this conversation' });
        return;
      }

      // Join the conversation room
      socket.join(conversationId);
      
      // Track users in conversation
      if (!conversationRooms.has(conversationId)) {
        conversationRooms.set(conversationId, new Set());
      }
      conversationRooms.get(conversationId)!.add(userId);

      console.log(`💬 User ${userId} joined conversation ${conversationId}`);
      
      // Notify other participants that user is online
      socket.to(conversationId).emit('user_joined', {
        userId,
        conversationId,
        timestamp: new Date()
      });

      // Send acknowledgment
      socket.emit('conversation_joined', { conversationId });

    } catch (error) {
      console.error('Error joining conversation:', error);
      socket.emit('error', { message: 'Failed to join conversation' });
    }
  });

  // Handle leaving a conversation
  socket.on('leave_conversation', (data: JoinConversationData) => {
    const { conversationId } = data;
    
    socket.leave(conversationId);
    
    // Remove from conversation tracking
    const room = conversationRooms.get(conversationId);
    if (room) {
      room.delete(userId);
      if (room.size === 0) {
        conversationRooms.delete(conversationId);
      }
    }

    // Notify other participants
    socket.to(conversationId).emit('user_left', {
      userId,
      conversationId,
      timestamp: new Date()
    });

    console.log(`👋 User ${userId} left conversation ${conversationId}`);
  });

  // Handle sending messages
  socket.on('send_message', async (data: SendMessageData) => {
    try {
      const { conversationId, content, type, fileUrl, duration, audioCallId } = data;
      
      // Verify conversation exists and user is a participant
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      const isParticipant = conversation.participants.seeker.toString() === userId || 
                           conversation.participants.guide.toString() === userId;
      
      if (!isParticipant) {
        socket.emit('error', { message: 'Unauthorized to send message' });
        return;
      }

      // Create new message
      const newMessage = new Message({
        conversationId,
        sender: userId,
        type,
        content,
        fileUrl,
        duration,
        audioCallId,
        status: 'sent'
      });

      await newMessage.save();

      // Update conversation's last message
      conversation.lastMessage = newMessage._id;
      await conversation.save();

      // Populate sender info for the response
      await newMessage.populate('sender', 'alias email');

      const messageData = {
        _id: newMessage._id,
        conversationId,
        sender: newMessage.sender,
        type,
        content,
        fileUrl,
        duration,
        audioCallId,
        status: 'sent',
        createdAt: newMessage.createdAt,
        updatedAt: newMessage.updatedAt
      };

      // Emit to all participants in the conversation
      io.to(conversationId).emit('new_message', messageData);
      
      // Mark message as delivered to online users
      const room = conversationRooms.get(conversationId);
      if (room && room.size > 1) {
        newMessage.status = 'delivered';
        await newMessage.save();
        
        io.to(conversationId).emit('message_delivered', {
          messageId: newMessage._id,
          conversationId
        });
      }

      console.log(`📨 Message sent in conversation ${conversationId} by user ${userId}`);

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle message read status
  socket.on('mark_messages_read', async (data: { conversationId: string; messageIds: string[] }) => {
    try {
      const { conversationId, messageIds } = data;
      
      // Update read status for messages
      await Message.updateMany(
        { 
          _id: { $in: messageIds },
          conversationId,
          sender: { $ne: userId }
        },
        {
          $addToSet: { readBy: userId },
          status: 'read'
        }
      );

      // Notify other participants
      socket.to(conversationId).emit('messages_read', {
        userId,
        conversationId,
        messageIds
      });

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Handle typing indicators
  socket.on('typing', (data: TypingData) => {
    const { conversationId, isTyping } = data;
    
    socket.to(conversationId).emit('user_typing', {
      userId,
      conversationId,
      isTyping
    });
  });

  // Audio call events
  socket.on('audio_call_initiate', async (data: AudioCallData) => {
    try {
      const { conversationId, callId, offer } = data;
      
      console.log(`📞 Audio call initiated by ${userId} in conversation ${conversationId}`);
      
      // Create system message for call initiation
      const callMessage = new Message({
        conversationId,
        sender: userId,
        type: 'audio_invite',
        content: 'Audio call invitation',
        audioCallId: callId,
        status: 'sent'
      });
      
      await callMessage.save();
      
      // Notify other participants
      socket.to(conversationId).emit('audio_call_incoming', {
        callId,
        conversationId,
        caller: userId,
        offer,
        messageId: callMessage._id
      });

    } catch (error) {
      console.error('Error initiating audio call:', error);
      socket.emit('error', { message: 'Failed to initiate call' });
    }
  });

  socket.on('audio_call_answer', (data: AudioCallData) => {
    const { conversationId, callId, answer } = data;
    
    console.log(`📞 Audio call answered by ${userId}`);
    
    socket.to(conversationId).emit('audio_call_answered', {
      callId,
      conversationId,
      answerer: userId,
      answer
    });
  });

  socket.on('audio_call_reject', async (data: AudioCallData) => {
    try {
      const { conversationId, callId } = data;
      
      console.log(`📞 Audio call rejected by ${userId}`);
      
      // Create system message for call rejection
      const rejectMessage = new Message({
        conversationId,
        sender: userId,
        type: 'audio_reject',
        content: 'Call declined',
        audioCallId: callId,
        status: 'sent'
      });
      
      await rejectMessage.save();
      
      socket.to(conversationId).emit('audio_call_rejected', {
        callId,
        conversationId,
        rejector: userId
      });

    } catch (error) {
      console.error('Error rejecting audio call:', error);
    }
  });

  socket.on('audio_call_end', (data: AudioCallData) => {
    const { conversationId, callId } = data;
    
    console.log(`📞 Audio call ended by ${userId}`);
    
    socket.to(conversationId).emit('audio_call_ended', {
      callId,
      conversationId,
      endedBy: userId
    });
  });

  // WebRTC signaling for peer-to-peer connection
  socket.on('ice_candidate', (data: AudioCallData) => {
    const { conversationId, iceCandidate } = data;
    
    socket.to(conversationId).emit('ice_candidate', {
      candidate: iceCandidate,
      from: userId
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${userId}`);
    
    // Remove from user mapping
    userSocketMap.delete(userId);
    
    // Remove from all conversation rooms
    conversationRooms.forEach((users, conversationId) => {
      if (users.has(userId)) {
        users.delete(userId);
        // Notify other participants
        socket.to(conversationId).emit('user_left', {
          userId,
          conversationId,
          timestamp: new Date()
        });
        
        // Clean up empty rooms
        if (users.size === 0) {
          conversationRooms.delete(conversationId);
        }
      }
    });
  });

  // Error handling
  socket.on('error', (error) => {
    console.error(`Socket error for user ${userId}:`, error);
  });
});

// REST API Endpoints for integration with main app

// Get conversation messages
app.get('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'alias email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    res.json({ 
      messages: messages.reverse(), // Return in chronological order
      page: Number(page),
      hasMore: messages.length === Number(limit)
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get user's conversations
app.get('/api/users/:userId/conversations', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const conversations = await Conversation.find({
      $or: [
        { 'participants.seeker': userId },
        { 'participants.guide': userId }
      ]
    })
    .populate('participants.seeker', 'alias email')
    .populate('participants.guide', 'alias email')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
    
    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Create or get conversation between two users
app.post('/api/conversations', async (req, res) => {
  try {
    const { seekerId, guideId } = req.body;
    
    if (!seekerId || !guideId) {
      return res.status(400).json({ error: 'Both seekerId and guideId are required' });
    }
    
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      'participants.seeker': seekerId,
      'participants.guide': guideId
    });
    
    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: {
          seeker: seekerId,
          guide: guideId
        },
        status: 'active'
      });
      await conversation.save();
    }
    
    // Populate participant details
    await conversation.populate('participants.seeker', 'alias email');
    await conversation.populate('participants.guide', 'alias email');
    
    return res.json({ conversation });
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    return res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Mark messages as read
app.put('/api/conversations/:conversationId/messages/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, messageIds } = req.body;
    
    await Message.updateMany(
      { 
        _id: { $in: messageIds },
        conversationId,
        sender: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId },
        status: 'read'
      }
    );
    
    // Notify via socket if user is online
    const userSocketId = userSocketMap.get(userId);
    if (userSocketId) {
      io.to(conversationId).emit('messages_read', {
        userId,
        conversationId,
        messageIds
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get online users in a conversation
app.get('/api/conversations/:conversationId/online-users', (req, res) => {
  const { conversationId } = req.params;
  const room = conversationRooms.get(conversationId);
  const onlineUsers = room ? Array.from(room) : [];
  
  res.json({ onlineUsers });
});

// Get server statistics
app.get('/api/stats', (_req, res) => {
  res.json({
    connectedUsers: userSocketMap.size,
    activeConversations: conversationRooms.size,
    totalUsers: Array.from(conversationRooms.values()).reduce((acc, room) => acc + room.size, 0),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    connectedUsers: userSocketMap.size,
    activeConversations: conversationRooms.size,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({ 
    message: 'PeerAid WebSocket Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      stats: '/api/stats',
      conversations: '/api/conversations',
      messages: '/api/conversations/:conversationId/messages'
    }
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Express error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.SOCKET_PORT || process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 PeerAid WebSocket Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${frontendUrl}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Stats: http://localhost:${PORT}/api/stats`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});