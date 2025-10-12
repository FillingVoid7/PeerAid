'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { WebSocketClient } from '@/lib/websocket-client';

// Types
export interface ChatUser {
  _id: string;
  alias: string;
  email: string;
  avatar?: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  sender: ChatUser;
  type: 'text' | 'image' | 'audio' | 'system' | 'audio_invite' | 'audio_accept' | 'audio_reject';
  content: string;
  fileUrl?: string;
  duration?: number;
  status: 'sent' | 'delivered' | 'read';
  readBy: string[];
  audioCallId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatConversation {
  _id: string;
  participants: {
    seeker: ChatUser;
    guide: ChatUser;
  };
  status: 'active' | 'inactive';
  lastMessage?: string;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TypingStatus {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

export interface OnlineUser {
  userId: string;
  conversationId: string;
  isOnline: boolean;
}

interface ChatContextType {                  // Define the shape of the context for the components
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  
  // Current conversation
  currentConversation: ChatConversation | null;
  setCurrentConversation: (conversation: ChatConversation | null) => void;
  
  // Messages
  messages: ChatMessage[];
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  
  // Conversations
  conversations: ChatConversation[];
  isLoadingConversations: boolean;
  
  // Real-time features
  typingUsers: TypingStatus[];
  onlineUsers: OnlineUser[];
  
  // Actions
  sendMessage: (content: string, type?: ChatMessage['type'], fileUrl?: string, duration?: number) => Promise<void>;
  loadMessages: (conversationId: string, page?: number) => Promise<void>;
  loadConversations: () => Promise<void>;
  markAsRead: (conversationId: string, messageIds: string[]) => Promise<void>;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  
  // Audio calls
  initiateAudioCall: (conversationId: string) => Promise<string>;
  answerAudioCall: (callId: string) => Promise<void>;
  rejectAudioCall: (callId: string) => Promise<void>;
  endAudioCall: (callId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const [webSocketClient] = useState(new WebSocketClient());
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Current conversation
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  
  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  
  // Conversations
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  
  // Real-time features
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (session?.user?.id && !isConnected && !isConnecting) {
      connectWebSocket();
    }

    return () => {
      if (webSocketClient) {
        webSocketClient.disconnect();
      }
    };
  }, [session?.user?.id]);

  const connectWebSocket = async () => {
    if (!session?.user?.id) {
      console.error('No user ID available in session');
      return;
    }

    console.log(' Attempting to connect with userId:', session.user.id);
    setIsConnecting(true);
    try {
      // Set up event listeners before connecting
      setupEventListeners();
      
      // Connect to WebSocket
      await webSocketClient.connect(session.user.id);
      
      // Connection status will be updated via the 'connect' event listener
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setIsConnected(false);
      setIsConnecting(false);
    }
  };

  const setupEventListeners = () => {
    // New message received
    webSocketClient.on('new_message', (message: ChatMessage) => {
      setMessages(prev => {
        const exists = prev.find(m => m._id === message._id);
        if (exists) return prev;
        return [message, ...prev];
      });

      // Update conversation's last message
      setConversations(prev => 
        prev.map(conv => 
          conv._id === message.conversationId 
            ? { ...conv, lastMessage: message.content, updatedAt: message.createdAt }
            : conv
        )
      );
    });

    // Message delivered status
    webSocketClient.on('message_delivered', ({ messageId, conversationId }: { 
      messageId: string; 
      conversationId: string;
    }) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, status: 'delivered' }
            : msg
        )
      );
    });

    // Messages read status
    webSocketClient.on('messages_read', ({ userId, conversationId, messageIds }: { 
      userId: string;
      conversationId: string;
      messageIds: string[];
    }) => {
      setMessages(prev => 
        prev.map(msg => 
          messageIds.includes(msg._id) && msg.conversationId === conversationId
            ? { ...msg, status: 'read', readBy: [...msg.readBy, userId] }
            : msg
        )
      );
    });

    // Typing indicators
    webSocketClient.on('user_typing', ({ userId, conversationId, isTyping }: TypingStatus) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(t => !(t.userId === userId && t.conversationId === conversationId));
        if (isTyping) {
          return [...filtered, { userId, conversationId, isTyping }];
        }
        return filtered;
      });

      // Clear typing after 3 seconds
      if (isTyping) {
        setTimeout(() => {
          setTypingUsers(prev => 
            prev.filter(t => !(t.userId === userId && t.conversationId === conversationId))
          );
        }, 3000);
      }
    });

    // User joined/left conversation
    webSocketClient.on('user_joined', ({ userId, conversationId, timestamp }: { 
      userId: string;
      conversationId: string;
      timestamp: Date;
    }) => {
      setOnlineUsers(prev => {
        const filtered = prev.filter(u => !(u.userId === userId && u.conversationId === conversationId));
        return [...filtered, { userId, conversationId, isOnline: true }];
      });
    });

    webSocketClient.on('user_left', ({ userId, conversationId, timestamp }: { 
      userId: string;
      conversationId: string;
      timestamp: Date;
    }) => {
      setOnlineUsers(prev => 
        prev.filter(u => !(u.userId === userId && u.conversationId === conversationId))
      );
    });

    // Connection events
    webSocketClient.on('connect', () => {
      console.log('WebSocket connected successfully');
      setIsConnected(true);
      setIsConnecting(false);
    });
    webSocketClient.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setIsConnecting(false);
    });
  };

  // Send message
  const sendMessage = useCallback(async (
    content: string, 
    type: ChatMessage['type'] = 'text', 
    fileUrl?: string, 
    duration?: number
  ) => {
    if (!currentConversation || !webSocketClient) return;

    try {
      webSocketClient.sendMessage({
        conversationId: currentConversation._id,
        content,
        type,
        fileUrl,
        duration
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [currentConversation, webSocketClient]);

  // Load messages
  const loadMessages = useCallback(async (conversationId: string, page = 1) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      const data = await response.json();
      if (data.success) {
        if (page === 1) {
          setMessages(data.messages);
        } else {
          setMessages(prev => [...prev, ...data.messages]);
        }
        setHasMoreMessages(data.hasMore);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setIsLoadingConversations(true);
    try {
      const response = await fetch(`/api/users/${session.user.id}/conversations`);
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [session?.user?.id]);

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string, messageIds: string[]) => {
    try {
      webSocketClient.markMessagesAsRead(conversationId, messageIds);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [webSocketClient]);

  // Set typing status
  const setTyping = useCallback((conversationId: string, isTyping: boolean) => {
    if (webSocketClient) {
      webSocketClient.sendTyping(conversationId, isTyping);
    }
  }, [webSocketClient]);

  // Audio call functions
  const initiateAudioCall = useCallback(async (conversationId: string): Promise<string> => {
    if (!webSocketClient) throw new Error('WebSocket not connected');
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // We'll need to create the offer first, for now just return the callId
    // This will be implemented properly in the audio call component
    return callId;
  }, [webSocketClient]);

  const answerAudioCall = useCallback(async (callId: string) => {
    if (!webSocketClient) throw new Error('WebSocket not connected');
    // This will be implemented with proper WebRTC handling
    console.log('Answering call:', callId);
  }, [webSocketClient]);

  const rejectAudioCall = useCallback(async (callId: string) => {
    if (!webSocketClient) throw new Error('WebSocket not connected');
    // Extract conversationId from the call context
    // webSocketClient.rejectAudioCall(conversationId, callId);
    console.log('Rejecting call:', callId);
  }, [webSocketClient]);

  const endAudioCall = useCallback(async (callId: string) => {
    if (!webSocketClient) throw new Error('WebSocket not connected');
    // Extract conversationId from the call context
    // webSocketClient.endAudioCall(conversationId, callId);
    console.log('Ending call:', callId);
  }, [webSocketClient]);

  // Join/leave conversation when current conversation changes
  useEffect(() => {
    if (currentConversation && webSocketClient && isConnected) {
      console.log(`Attempting to join conversation: ${currentConversation._id}`);
      
      const attemptJoin = async () => {
        try {
          await webSocketClient.joinConversation(currentConversation!._id);
          console.log(`Successfully joined conversation: ${currentConversation._id}`);
          loadMessages(currentConversation._id);
        } catch (error) {
          console.error(`Failed to join conversation: ${currentConversation._id}`, error);
        }
      };
      
      attemptJoin();

      return () => {
        webSocketClient.leaveConversation(currentConversation._id);
      };
    }
  }, [currentConversation, webSocketClient, isConnected, loadMessages]);

  const value: ChatContextType = {
    // Connection state
    isConnected,
    isConnecting,
    
    // Current conversation
    currentConversation,
    setCurrentConversation,
    
    // Messages
    messages,
    isLoadingMessages,
    hasMoreMessages,
    
    // Conversations
    conversations,
    isLoadingConversations,
    
    // Real-time features
    typingUsers,
    onlineUsers,
    
    // Actions
    sendMessage,
    loadMessages,
    loadConversations,
    markAsRead,
    setTyping,
    
    // Audio calls
    initiateAudioCall,
    answerAudioCall,
    rejectAudioCall,
    endAudioCall,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};