import { io, Socket } from 'socket.io-client';

const WEBSOCKET_SERVER_URL = process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL || 'http://localhost:3001';
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  iceCandidate?: RTCIceCandidate;
}

interface TypingData {
  conversationId: string;
  isTyping: boolean;
}

interface ConversationResponse {
  success: boolean;
  conversation: {
    _id: string;
    participants: {
      seeker: { _id: string; alias: string; email: string };
      guide: { _id: string; alias: string; email: string };
    };
    status: 'active' | 'inactive';
    lastMessage?: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface MessageResponse {
  success: boolean;
  messages: Array<{
    _id: string;
    conversationId: string;
    sender: { _id: string; alias: string; email: string };
    type: string;
    content: string;
    fileUrl?: string;
    duration?: number;
    status: 'sent' | 'delivered' | 'read';
    readBy: string[];
    audioCallId?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  page: number;
  hasMore: boolean;
}

interface OnlineUsersResponse {
  success: boolean;
  conversationId: string;
  onlineUsers: string[];
  count: number;
  timestamp: string;
}

class WebSocketClient {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventListeners: Map<string, Function[]> = new Map();

  // Connect to WebSocket server
  connect(token: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      this.socket = io(WEBSOCKET_SERVER_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 20000
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        resolve(this.socket!);
      });

      this.socket.on('disconnect', (reason: string) => {
        console.log('Disconnected from WebSocket server:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error: Error) => {
        console.error(' WebSocket connection error:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
        }
      });

      this.socket.on('error', (error: any) => {
        console.error('❌ WebSocket error:', error);
      });

      this.setupEventForwarding();
    });
  }

  // Setup automatic event forwarding to registered listeners
  private setupEventForwarding() {
    if (!this.socket) return;

    const events = [
      'user_joined', 'user_left', 'new_message', 'message_delivered', 
      'messages_read', 'user_typing', 'audio_call_incoming', 
      'audio_call_answered', 'audio_call_rejected', 'audio_call_ended',
      'conversation_joined', 'error'
    ];

    events.forEach(event => {
      this.socket!.on(event, (data: any) => {
        const listeners = this.eventListeners.get(event);     // Find all components listening for 'new_message'
        if (listeners) {
          listeners.forEach(listener => listener(data));          // Call each listener with the message data
        }
      });
    });
  }

  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.eventListeners.delete(event);
      return;
    }
    
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Conversation management
  async joinConversation(conversationId: string): Promise<boolean> {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('join_conversation', { conversationId });
      
      const timeout = setTimeout(() => {
        reject(new Error('Join conversation timeout'));
      }, 10000);

      this.socket!.once('conversation_joined', (data: { conversationId: string }) => {
        clearTimeout(timeout);
        if (data.conversationId === conversationId) {
          resolve(true);
        }
      });

      this.socket!.once('error', (error: { message: string }) => {
        clearTimeout(timeout);
        reject(new Error(error.message));
      });
    });
  }

  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  // Message management
  sendMessage(data: SendMessageData) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }
    this.socket.emit('send_message', data);
  }

  markMessagesAsRead(conversationId: string, messageIds: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('mark_messages_read', { conversationId, messageIds });
    }
  }

  // Typing indicators
  sendTyping(conversationId: string, isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { conversationId, isTyping });
    }
  }

  // Audio call management
  initiateAudioCall(conversationId: string, callId: string, offer: RTCSessionDescriptionInit) {
    if (this.socket?.connected) {
      this.socket.emit('audio_call_initiate', { conversationId, callId, offer });
    }
  }

  answerAudioCall(conversationId: string, callId: string, answer: RTCSessionDescriptionInit) {
    if (this.socket?.connected) {
      this.socket.emit('audio_call_answer', { conversationId, callId, answer });
    }
  }

  rejectAudioCall(conversationId: string, callId: string) {
    if (this.socket?.connected) {
      this.socket.emit('audio_call_reject', { conversationId, callId });
    }
  }

  endAudioCall(conversationId: string, callId: string) {
    if (this.socket?.connected) {
      this.socket.emit('audio_call_end', { conversationId, callId });
    }
  }

  sendIceCandidate(conversationId: string, callId: string, iceCandidate: RTCIceCandidate) {
    if (this.socket?.connected) {
      this.socket.emit('ice_candidate', { conversationId, callId, iceCandidate });
    }
  }

  // Connection status
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
    this.eventListeners.clear();
  }
}

const wsClient = new WebSocketClient();

 // Create or get existing conversation between seeker and guide
 
export async function createOrGetConversation(seekerId: string, guideId: string): Promise<ConversationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seekerId, guideId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create/get conversation: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    throw error;
  }
}

 // Get latest messages for a conversation
 
export async function getConversationMessages(
  conversationId: string, 
  page: number = 1, 
  limit: number = 50
): Promise<MessageResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/conversations/${conversationId}/messages`
    );

    if (!response.ok) {
      throw new Error(`Failed to get messages: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw error;
  }
}


//  Mark messages as read 

export async function markMessagesAsReadAPI(
  conversationId: string, 
  userId: string, 
  messageIds: string[]
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/conversations/${conversationId}/messages/read`, 
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, messageIds }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark messages as read: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
}


 // Get all conversations for a user
 
export async function getUserConversations(userId: string): Promise<{
  success: boolean;
  conversations: ConversationResponse['conversation'][];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/conversations`);

    if (!response.ok) {
      throw new Error(`Failed to get user conversations: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
}


//  Get online users from WebSocket server for a specific conversation
 
export async function getOnlineUsers(conversationId: string): Promise<OnlineUsersResponse> {
  try {
    if (!WEBSOCKET_SERVER_URL) {
      throw new Error('WebSocket server URL not configured');
    }

    const response = await fetch(`${WEBSOCKET_SERVER_URL}/api/conversations/${conversationId}/online-users`);
    
    if (!response.ok) {
      throw new Error(`Failed to get online users: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get online users from WebSocket server:', error);
    throw error;
  }
}


 // Get WebSocket server statistics
 
export async function getWebSocketStats(): Promise<{
  connectedUsers: number;
  activeConversations: number;
  totalUsers: number;
  uptime: number;
  timestamp: string;
}> {
  try {
    const response = await fetch(`${WEBSOCKET_SERVER_URL}/api/stats`);
    
    if (!response.ok) {
      throw new Error(`Failed to get WebSocket stats: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to get WebSocket stats:', error);
    throw error;
  }
}


 // Health check for WebSocket server
 
export async function checkWebSocketHealth(): Promise<{
  status: string;
  connectedUsers: number;
  activeConversations: number;
  timestamp: string;
  version: string;
}> {
  try {
    const response = await fetch(`${WEBSOCKET_SERVER_URL}/health`);
    
    if (!response.ok) {
      throw new Error(`WebSocket server health check failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('WebSocket health check failed:', error);
    throw error;
  }
}



//  Complete conversation setup: create/get conversation and join WebSocket room
 
export async function setupConversation(
  seekerId: string, 
  guideId: string, 
  token: string
): Promise<{ conversation: ConversationResponse['conversation']; socket: Socket }> {
  try {
    // 1. Create or get conversation via REST API
    const { conversation } = await createOrGetConversation(seekerId, guideId);
    
    // 2. Connect to WebSocket
    const socket = await wsClient.connect(token);
    
    // 3. Join conversation room
    await wsClient.joinConversation(conversation._id);
    
    return { conversation, socket };
  } catch (error) {
    console.error('Error setting up conversation:', error);
    throw error;
  }
}

/**
 * Send message with automatic fallback and retry
 */
export async function sendMessageWithRetry(
  data: SendMessageData, 
  maxRetries: number = 3
): Promise<boolean> {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      if (!wsClient.isSocketConnected()) {
        throw new Error('WebSocket not connected');
      }
      
      wsClient.sendMessage(data);
      return true;
    } catch (error) {
      attempts++;
      console.warn(`Message send attempt ${attempts} failed:`, error);
      
      if (attempts >= maxRetries) {
        throw new Error(`Failed to send message after ${maxRetries} attempts`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }
  
  return false;
}

/**
 * Mark messages as read (WebSocket + API sync)
 */
export async function markMessagesAsReadSync(
  conversationId: string, 
  userId: string, 
  messageIds: string[]
): Promise<void> {
  try {
    // 1. Mark via WebSocket for real-time update
    if (wsClient.isSocketConnected()) {
      wsClient.markMessagesAsRead(conversationId, messageIds);
    }
    
    // 2. Mark via REST API for persistence
    await markMessagesAsReadAPI(conversationId, userId, messageIds);
  } catch (error) {
    console.error('Error syncing message read status:', error);
    throw error;
  }
}

export { wsClient };

// Export types
export type {
  JoinConversationData,
  SendMessageData,
  AudioCallData,
  TypingData,
  ConversationResponse,
  MessageResponse,
  OnlineUsersResponse
};