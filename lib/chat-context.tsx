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
  type: 'text' | 'image' | 'audio' | 'system' | 'audio_invite' | 'audio_accept' | 'audio_reject' | 'file';
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileExtension?: string;
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
  lastMessage?: string | { content: string; createdAt: string };
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

export interface AudioCallState {
  callId: string | null;
  isIncoming: boolean;
  isActive: boolean;
  participant: ChatUser | null;
  status: 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';
}

interface ChatContextType {                  // Define the shape of the context for the components
  isConnected: boolean;
  isConnecting: boolean;
  
  currentConversation: ChatConversation | null;
  setCurrentConversation: (conversation: ChatConversation | null) => void;
  
  messages: ChatMessage[];
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  
  conversations: ChatConversation[];
  isLoadingConversations: boolean;
  
  typingUsers: TypingStatus[];
  onlineUsers: OnlineUser[];
  
  audioCall: AudioCallState;
  
  sendMessage: (content: string, type?: ChatMessage['type'], fileData?: { fileUrl?: string; fileName?: string; fileSize?: number; fileExtension?: string; duration?: number }) => Promise<void>;
  loadMessages: (conversationId: string, page?: number) => Promise<void>;
  loadConversations: () => Promise<void>;
  markAsRead: (conversationId: string, messageIds: string[]) => Promise<void>;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  
  initiateAudioCall: (conversationId: string) => Promise<string>;
  answerAudioCall: (callId: string) => Promise<void>;
  rejectAudioCall: (callId: string) => Promise<void>;
  endAudioCall: (callId: string) => Promise<void>;
  setAudioCallState: (state: Partial<AudioCallState>) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const [webSocketClient] = useState(new WebSocketClient());
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  
  const [audioCall, setAudioCall] = useState<AudioCallState>({
    callId: null,
    isIncoming: false,
    isActive: false,
    participant: null,
    status: 'idle'
  });

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
      setupEventListeners();
      await webSocketClient.connect(session.user.id);
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
          return [...prev, message];
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
      const idSet = new Set((messageIds || []).map(id => String(id)));
      console.log('[READ][CLIENT] messages_read received', { userId, conversationId, count: idSet.size, sample: Array.from(idSet).slice(0,5) });
      setMessages(prev => {
        let mutated = false;
        const next: ChatMessage[] = prev.map((msg: ChatMessage) => {
          const sameConversation = msg.conversationId === conversationId;
          const isTarget = idSet.has(String(msg._id));
          if (sameConversation && isTarget) {
            const existingReadBy = msg.readBy || [];
            const nextReadBy = existingReadBy.includes(userId) ? existingReadBy : [...existingReadBy, userId];
            console.log('[READ][CLIENT] updating message to read', { messageId: msg._id });
            mutated = true;
            return { ...msg, status: 'read' as const, readBy: nextReadBy };
          }
          return msg;
        });
        if (!mutated) {
          console.warn('[READ][CLIENT] messages_read received but no local messages updated');
        }
        return next;
      });
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

    // Online users snapshot on join (ensures both sides see each other as online)
    webSocketClient.on('online_users', ({ conversationId, onlineUsers: userIds }: { 
      conversationId: string; 
      onlineUsers: string[]; 
    }) => {
      setOnlineUsers(prev => {
        // Remove existing records for this conversation, then add snapshot
        const remaining = prev.filter(u => u.conversationId !== conversationId);
        const snapshot: OnlineUser[] = userIds.map(id => ({ userId: id, conversationId, isOnline: true }));
        return [...remaining, ...snapshot];
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

    // Audio call events
    webSocketClient.on('audio_call_incoming', (data: {
      callId: string;
      conversationId: string;
      caller: string;
      offer: RTCSessionDescriptionInit;
      messageId: string;
    }) => {
      console.log('Incoming audio call:', data);
      
      // Find caller info from current conversation
      const callerInfo = currentConversation?.participants.seeker._id === data.caller 
        ? currentConversation.participants.seeker
        : currentConversation?.participants.guide._id === data.caller 
          ? currentConversation.participants.guide 
          : null;

      setAudioCall({
        callId: data.callId,
        isIncoming: true,
        isActive: true,
        participant: callerInfo,
        status: 'ringing'
      });
    });

    webSocketClient.on('audio_call_answered', (data: {
      callId: string;
      conversationId: string;
      answerer: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      console.log('Audio call answered:', data);
      if (audioCall.callId === data.callId) {
        setAudioCall(prev => ({ ...prev, status: 'connected' }));
      }
    });

    webSocketClient.on('audio_call_rejected', (data: {
      callId: string;
      conversationId: string;
      rejector: string;
    }) => {
      console.log('Audio call rejected:', data);
      if (audioCall.callId === data.callId) {
        setAudioCall(prev => ({ ...prev, status: 'ended', isActive: false }));
      }
    });

    webSocketClient.on('audio_call_ended', (data: {
      callId: string;
      conversationId: string;
      endedBy: string;
    }) => {
      console.log('Audio call ended:', data);
      if (audioCall.callId === data.callId) {
        setAudioCall(prev => ({ ...prev, status: 'ended', isActive: false }));
      }
    });

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
    fileData?: { fileUrl?: string; fileName?: string; fileSize?: number; fileExtension?: string; duration?: number }
  ) => {
    if (!currentConversation || !webSocketClient) return;

    try {
      webSocketClient.sendMessage({
        conversationId: currentConversation._id,
        content,
        type,
        fileUrl: fileData?.fileUrl,
        fileName: fileData?.fileName,
        fileSize: fileData?.fileSize,
        fileExtension: fileData?.fileExtension,
        duration: fileData?.duration
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
          setMessages(prev => {
            const combined = [...prev, ...data.messages];
            const unique = combined.filter((msg, index, arr) => 
              arr.findIndex(m => m._id === msg._id) === index
            );
            return unique;
          });
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
    if (!webSocketClient || !currentConversation) throw new Error('WebSocket not connected or no conversation');
    
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Set outgoing call state
    const otherParticipant = currentConversation.participants.seeker._id === session?.user?.id 
      ? currentConversation.participants.guide 
      : currentConversation.participants.seeker;
    
    setAudioCall({
      callId,
      isIncoming: false,
      isActive: true,
      participant: otherParticipant,
      status: 'ringing'
    });
    
    return callId;
  }, [webSocketClient, currentConversation, session?.user?.id]);

  const answerAudioCall = useCallback(async (callId: string) => {
    if (!webSocketClient || !currentConversation) throw new Error('WebSocket not connected or no conversation');
    
    setAudioCall(prev => ({ ...prev, status: 'connecting' }));
    
    console.log('Answering call:', callId);
  }, [webSocketClient, currentConversation]);

  const rejectAudioCall = useCallback(async (callId: string) => {
    if (!webSocketClient || !currentConversation) throw new Error('WebSocket not connected or no conversation');
    
    webSocketClient.rejectAudioCall(currentConversation._id, callId);
    setAudioCall(prev => ({ ...prev, status: 'ended', isActive: false }));
  }, [webSocketClient, currentConversation]);

  const endAudioCall = useCallback(async (callId: string) => {
    if (!webSocketClient || !currentConversation) throw new Error('WebSocket not connected or no conversation');
    
    webSocketClient.endAudioCall(currentConversation._id, callId);
    setAudioCall(prev => ({ ...prev, status: 'ended', isActive: false }));
  }, [webSocketClient, currentConversation]);

  // Helper function to update audio call state
  const setAudioCallState = useCallback((state: Partial<AudioCallState>) => {
    setAudioCall(prev => ({ ...prev, ...state }));
  }, []);

  // Join/leave conversation when current conversation changes
  useEffect(() => {
    if (currentConversation && webSocketClient && isConnected) {
      console.log(`Attempting to join conversation: ${currentConversation._id}`);
      setMessages([]);
      
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
    isConnected,
    isConnecting,
    
    currentConversation,
    setCurrentConversation,
    
    messages,
    isLoadingMessages,
    hasMoreMessages,
    
    conversations,
    isLoadingConversations,
    
    // Real-time features
    typingUsers,
    onlineUsers,
    
    // Audio call state
    audioCall,
    
    sendMessage,
    loadMessages,
    loadConversations,
    markAsRead,
    setTyping,
    
    // Audio call functions
    initiateAudioCall,
    answerAudioCall,
    rejectAudioCall,
    endAudioCall,
    setAudioCallState,
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