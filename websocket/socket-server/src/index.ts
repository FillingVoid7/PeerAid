import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import mongoose, { Types } from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import {User} from '../models/User.js';
import { Conversation } from '../models/chatConversation.js';
import { Message } from '../models/message.js';
import { connectDB } from '../../../lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const app = express();
const server = http.createServer(app);                                    // raw http server to attach with socket.io for the websocket connection
app.use(express.json());

const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
app.use(cors({
  origin: [frontendUrl, 'http://localhost:3000', 'https://peer-aid.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Socket.IO configuration 
const io = new SocketIOServer(server, {                                // both http server and socket.io server share the same port
  cors: {
    origin: [frontendUrl, 'http://localhost:3000', 'https://peer-aid.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

const mongooseOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000, 
  socketTimeoutMS: 45000, 
  connectTimeoutMS: 10000, 
  family: 4
};


// Store active connections and conversation rooms
const userSocketMap = new Map<string, string>();
const conversationRooms = new Map<string, Set<string>>();

interface JoinConversationData {
  conversationId: string;
}

interface SendMessageData {
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'system' | 'audio_invite' | 'audio_accept' | 'audio_reject' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileExtension?: string;
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

io.use(async (socket, next) => {
  try {
    const userId = socket.handshake.auth.userId;
    
    if (!userId) {
      return next(new Error('Authentication error: No userId provided'));
    }

    socket.data.userId = userId;
    
    console.log(` User connected: ${userId}`);
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid userId'));
  }
});

// Socket event handlers
io.on('connection', (socket) => {
  const userId = socket.data.userId;
  console.log(`User connected: ${userId} (Socket: ${socket.id})`);
  
  // Store user-socket mapping
  userSocketMap.set(userId, socket.id);

  // Join user to their personal room for notifications
  socket.join(`user:${userId}`);

  // Handle joining a conversation
  socket.on('join_conversation', async (data: JoinConversationData) => {
    try {
      const { conversationId } = data;
      
      // Set a timeout for the MongoDB operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 8000); // 8 second timeout
      });

      // Verify user is part of this conversation with timeout
      const conversationPromise = Conversation.findById(conversationId)
        .populate('participants.seeker', 'alias email')
        .populate('participants.guide', 'alias email');
      
      const conversation = await Promise.race([conversationPromise, timeoutPromise]) as any;
      
      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found' });
        return;
      }

      const isParticipant = conversation.participants.seeker._id.toString() === userId || 
                           conversation.participants.guide._id.toString() === userId;
      
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

      console.log(` User ${userId} joined conversation ${conversationId}`);
      
      // Notify other participants that user is online
      socket.to(conversationId).emit('user_joined', {
        userId,
        conversationId,
        timestamp: new Date()
      });

      // Send current online users snapshot to the joining user
      try {
        const room = conversationRooms.get(conversationId);
        const onlineUsers = room ? Array.from(room) : [];
        socket.emit('online_users', {
          conversationId,
          onlineUsers
        });
      } catch (e) {
      }

      // Send acknowledgment
      socket.emit('conversation_joined', { conversationId });

    } catch (error) {
      console.error('Error joining conversation:', error);
      if (error instanceof Error && error.message === 'Database query timeout') {
        socket.emit('error', { message: 'Database connection timeout. Please try again.' });
      } else {
        socket.emit('error', { message: 'Failed to join conversation' });
      }
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
      const { conversationId, content, type, fileUrl, fileName, fileSize, fileExtension, duration, audioCallId } = data;
      
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
        fileName,
        fileSize,
        fileExtension,
        duration,
        audioCallId,
        status: 'sent'  
      });

      await newMessage.save();

      // Update conversation's last message
      conversation.lastMessage = newMessage._id as Types.ObjectId;
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
        fileName,
        fileSize,
        fileExtension,
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

      console.log(` Message sent in conversation ${conversationId} by user ${userId}`);

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle message read status
  socket.on('mark_messages_read', async (data: { conversationId: string; messageIds: string[] }) => {
    try {
      const { conversationId, messageIds } = data;
      console.log('[READ][SERVER] received', { userId, conversationId, messageIdsCount: (messageIds||[]).length, sample: (messageIds||[]).slice(0,5) });

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
      console.log('[READ][SERVER] updated messages');
      io.to(conversationId).emit('messages_read', {
        userId,
        conversationId,
        messageIds
      });
      console.log('[READ][SERVER] emitted messages_read');

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
      
      console.log(` Audio call initiated by ${userId} in conversation ${conversationId}`);
      
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
    
    console.log(` Audio call answered by ${userId}`);
    
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
      
      console.log(` Audio call rejected by ${userId}`);
      
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
    
    console.log(`Audio call ended by ${userId}`);
    
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
    console.log(`User disconnected: ${userId}`);
    
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

// Get online users in a specific conversation
app.get('/api/conversations/:conversationId/online-users', (_req, res) => {
  const { conversationId } = _req.params;
  
  const room = conversationRooms.get(conversationId);
  const onlineUsers = room ? Array.from(room) : [];
  
  res.json({
    success: true,
    conversationId,
    onlineUsers,
    count: onlineUsers.length,
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
    description: 'Real-time WebSocket server for peer-to-peer conversations, messaging, and audio calls',
    features: [
      'Real-time messaging',
      'Audio call support with WebRTC',
      'User presence tracking',
      'Message delivery status',
      'Typing indicators',
      'JWT authentication'
    ],
    endpoints: {
      root: {
        method: 'GET',
        path: '/',
        description: 'Server information and API documentation'
      },
      health: {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint with connection stats'
      },
      stats: {
        method: 'GET',
        path: '/api/stats',
        description: 'Real-time server statistics (connected users, active conversations)'
      }
    },
    socketEvents: {
      clientToServer: {
        join_conversation: {
          description: 'Join a specific conversation room',
          data: { conversationId: 'string' }
        },
        leave_conversation: {
          description: 'Leave a conversation room',
          data: { conversationId: 'string' }
        },
        send_message: {
          description: 'Send real-time messages',
          data: {
            conversationId: 'string',
            content: 'string',
            type: 'text|image|audio|system|audio_invite|audio_accept|audio_reject',
            fileUrl: 'string (optional)',
            duration: 'number (optional)',
            audioCallId: 'string (optional)'
          }
        },
        mark_messages_read: {
          description: 'Mark messages as read',
          data: { conversationId: 'string', messageIds: 'string[]' }
        },
        typing: {
          description: 'Send typing indicators',
          data: { conversationId: 'string', isTyping: 'boolean' }
        },
        audio_call_initiate: {
          description: 'Start an audio call',
          data: { conversationId: 'string', callId: 'string', offer: 'RTCSessionDescriptionInit' }
        },
        audio_call_answer: {
          description: 'Answer incoming call',
          data: { conversationId: 'string', callId: 'string', answer: 'RTCSessionDescriptionInit' }
        },
        audio_call_reject: {
          description: 'Reject incoming call',
          data: { conversationId: 'string', callId: 'string' }
        },
        audio_call_end: {
          description: 'End active call',
          data: { conversationId: 'string', callId: 'string' }
        },
        ice_candidate: {
          description: 'WebRTC ICE candidate exchange',
          data: { conversationId: 'string', callId: 'string', iceCandidate: 'RTCIceCandidate' }
        }
      },
      serverToClient: {
        user_joined: {
          description: 'User joined conversation',
          data: { userId: 'string', conversationId: 'string', timestamp: 'Date' }
        },
        user_left: {
          description: 'User left conversation',
          data: { userId: 'string', conversationId: 'string', timestamp: 'Date' }
        },
            online_users: {
              description: 'Snapshot of currently online users in the room, sent to the joiner',
              data: { conversationId: 'string', onlineUsers: 'string[]' }
            },
        new_message: {
          description: 'New message broadcast to all participants',
          data: { _id: 'string', conversationId: 'string', sender: 'UserObject', content: 'string', type: 'string', status: 'sent|delivered|read', createdAt: 'Date' }
        },
        message_delivered: {
          description: 'Message delivery confirmation',
          data: { messageId: 'string', conversationId: 'string' }
        },
        messages_read: {
          description: 'Messages marked as read by user',
          data: { userId: 'string', conversationId: 'string', messageIds: 'string[]' }
        },
        user_typing: {
          description: 'User typing indicator',
          data: { userId: 'string', conversationId: 'string', isTyping: 'boolean' }
        },
        audio_call_incoming: {
          description: 'Incoming audio call notification',
          data: { callId: 'string', conversationId: 'string', caller: 'string', offer: 'RTCSessionDescriptionInit', messageId: 'string' }
        },
        audio_call_answered: {
          description: 'Call answered notification',
          data: { callId: 'string', conversationId: 'string', answerer: 'string', answer: 'RTCSessionDescriptionInit' }
        },
        audio_call_rejected: {
          description: 'Call rejected notification',
          data: { callId: 'string', conversationId: 'string', rejector: 'string' }
        },
        audio_call_ended: {
          description: 'Call ended notification',
          data: { callId: 'string', conversationId: 'string', ender: 'string' }
        },
        conversation_joined: {
          description: 'Confirmation of successful room join',
          data: { conversationId: 'string' }
        },
        error: {
          description: 'Error notifications',
          data: { message: 'string' }
        }
      }
    },
    connection: {
      authentication: 'JWT token required in socket.handshake.auth.token',
      cors: ['http://localhost:3000', 'https://peer-aid.vercel.app'],
      transports: ['websocket', 'polling'],
      pingTimeout: '60000ms',
      pingInterval: '25000ms'
    },
    usage: {
      connect: 'const socket = io("ws://localhost:3001", { auth: { token: "your-jwt-token" } })',
      workflow: [
        '1. Connect with valid JWT token',
        '2. socket.emit("join_conversation", { conversationId })',
        '3. Listen for real-time events (new_message, user_joined, etc.)',
        '4. Send messages via socket.emit("send_message", { ... })',
        '5. Handle audio calls with WebRTC events'
      ],
      note: 'For persistent data operations (create conversations, get message history), use the main Next.js app REST API endpoints'
    },
    statistics: {
      currentConnections: `${Array.from(userSocketMap || new Map()).length} users`,
      activeRooms: `${Array.from(conversationRooms || new Map()).length} conversations`,
      uptime: `${Math.floor(process.uptime())} seconds`
    }
  });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Express error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.SOCKET_PORT || process.env.PORT || 3001;

server.listen(PORT, async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
    console.log('User model registered:', User.modelName);
  } catch (err) {
    console.error('MongoDB connection error during startup:', err);
    process.exit(1);
  }

  console.log(`🚀 PeerAid WebSocket Server running on port ${PORT}`);
  console.log(`🌐 Frontend URL: ${frontendUrl}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Stats: http://localhost:${PORT}/api/stats`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});