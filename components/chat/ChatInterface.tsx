'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Phone, Video, MoreVertical, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { AudioCall } from './AudioCall';
import { useChat } from '@/lib/chat-context';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  onBack?: () => void;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack, className }) => {
  const { data: session } = useSession();
  const {
    currentConversation,
    messages,
    isLoadingMessages,
    hasMoreMessages,
    typingUsers,
    onlineUsers,
    isConnected,
    sendMessage,
    loadMessages,
    markAsRead,
    setTyping,
    initiateAudioCall,
    answerAudioCall,
    rejectAudioCall
  } = useChat();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [unreadMessageIds, setUnreadMessageIds] = useState<string[]>([]);

  const otherParticipant = currentConversation ? (
    currentConversation.participants.seeker._id === session?.user?.id
      ? currentConversation.participants.guide
      : currentConversation.participants.seeker
  ) : null;

  const isOtherUserOnline = currentConversation && onlineUsers.some(
    user => user.conversationId === currentConversation._id && 
             user.userId === otherParticipant?._id && 
             user.isOnline
  );

  const currentTypingUsers = currentConversation ? typingUsers
    .filter(typing => typing.conversationId === currentConversation._id && typing.isTyping)
    .map(typing => ({
      userId: typing.userId,
      alias: otherParticipant?.alias || 'User',
      isTyping: true
    })) : [];

  useEffect(() => {
    if (scrollAreaRef.current && messages.length > 0) {
      const scrollElement = scrollAreaRef.current;
      
      const scrollToBottom = () => {
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      };
      
      setTimeout(scrollToBottom, 10);
      
      requestAnimationFrame(scrollToBottom);
    }
  }, [messages.length]); 

  useEffect(() => {
    if (scrollAreaRef.current && currentConversation) {
      const scrollElement = scrollAreaRef.current;
      
      const scrollToBottom = () => {
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
          setIsNearBottom(true);
        }
      };
      
      setTimeout(scrollToBottom, 100);
      requestAnimationFrame(scrollToBottom);
    }
  }, [currentConversation?._id]);

  useEffect(() => {
    if (!currentConversation || messages.length === 0 || !session?.user?.id) return;

    const isTabVisible = typeof document !== 'undefined' ? document.visibilityState === 'visible' : true;
    if (!isNearBottom || !isTabVisible) return;

    const unreadMessages = messages.filter(
      msg => msg.sender._id !== session.user.id &&
             !(msg.readBy && msg.readBy.includes(session.user.id)) &&
             !unreadMessageIds.includes(msg._id)
    );

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(msg => msg._id);
      setUnreadMessageIds(prev => [...prev, ...messageIds]);
      console.log('[READ] UI marking as read', {
        conversationId: currentConversation._id,
        count: messageIds.length,
        sample: messageIds.slice(0, 5)
      });
      markAsRead(currentConversation._id, messageIds);
    }
  }, [messages, currentConversation, session?.user?.id, markAsRead, unreadMessageIds, isNearBottom]);

  // Handle scroll position tracking
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
    setIsNearBottom(isAtBottom);

    if (scrollTop === 0 && hasMoreMessages && !isLoadingMessages && currentConversation) {
      const currentPage = Math.ceil(messages.length / 20) + 1;
      loadMessages(currentConversation._id, currentPage);
    }
  }, [hasMoreMessages, isLoadingMessages, currentConversation, loadMessages, messages.length]);

  // Handle sending messages
  const handleSendMessage = useCallback(async (content: string, type: 'text' | 'audio' | 'file' = 'text', fileData?: any) => {
    if (!currentConversation) return;
    await sendMessage(content, type, fileData);
  }, [currentConversation, sendMessage]);

  // Handle typing indicators
  const handleStartTyping = useCallback(() => {
    if (currentConversation) {
      setTyping(currentConversation._id, true);
    }
  }, [currentConversation, setTyping]);

  const handleStopTyping = useCallback(() => {
    if (currentConversation) {
      setTyping(currentConversation._id, false);
    }
  }, [currentConversation, setTyping]);

  // Handle audio call initiation
  const handleInitiateCall = useCallback(async () => {
    if (!currentConversation) return;
    try {
      await initiateAudioCall(currentConversation._id);
    } catch (error) {
      console.error('Failed to initiate call:', error);
    }
  }, [currentConversation, initiateAudioCall]);

  // Handle audio call actions
  const handleCallAction = useCallback(async (action: 'answer' | 'reject', callId?: string) => {
    if (!callId) {
      console.error('No callId provided for call action:', action);
      return;
    }

    try {
      switch (action) {
        case 'answer':
          console.log('Answering call:', callId);
          await answerAudioCall(callId);
          break;
        case 'reject':
          console.log('Rejecting call:', callId);
          await rejectAudioCall(callId);
          break;
        default:
          console.error('Unknown call action:', action);
      }
    } catch (error) {
      console.error(`Failed to ${action} call:`, error);
      toast.message('Please try again.');
    }
  }, [answerAudioCall, rejectAudioCall]);

  // Handle input area click to mark all unread messages as read
  const handleInputClick = useCallback(() => {
    if (!currentConversation || !session?.user?.id) return;
    
    // Find all unread messages from others
    const unreadMessages = messages.filter(
      msg => msg.sender._id !== session.user.id && 
             !(msg.readBy && msg.readBy.includes(session.user.id))
    );
    
    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(msg => msg._id);
      console.log('[READ] Input clicked - marking all unread as read', { 
        conversationId: currentConversation._id, 
        count: messageIds.length 
      });
      markAsRead(currentConversation._id, messageIds);
    }
  }, [currentConversation, session?.user?.id, messages, markAsRead]);

  if (!currentConversation) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900", className)}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No conversation selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose a conversation to start chatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-gray-900 relative", className)}>
      {/* Audio Call Component */}
      <AudioCall />
      
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          
          <Avatar className="w-10 h-10">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center text-white font-medium">
              {otherParticipant?.alias.charAt(0).toUpperCase()}
            </div>
          </Avatar>
          
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              {otherParticipant?.alias}
            </h2>
            <div className="flex items-center gap-2">
              {isOtherUserOnline ? (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Online
                </Badge>
              ) : (
                <span className="text-xs text-gray-500">Offline</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleInitiateCall}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <Phone className="w-5 h-5" />
          </Button>

        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea 
        className="flex-1 px-4 py-2 overflow-auto"
        onScrollCapture={handleScroll}
        ref={scrollAreaRef}
      >
        <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-end">
          {isLoadingMessages && messages.length === 0 && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {hasMoreMessages && messages.length > 0 && (
            <div className="flex justify-center py-2">
              <Button variant="ghost" size="sm" className="text-sm text-gray-500">
                Load more messages
              </Button>
            </div>
          )}

          <div className="space-y-1">
            {messages.map((message, index) => {
              const isOwnMessage = message.sender._id === session?.user?.id;
              const isLastInGroup = index === messages.length - 1 || 
                messages[index + 1].sender._id !== message.sender._id;
              
              return (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwnMessage={isOwnMessage}
                  showAvatar={isLastInGroup}
                  currentUser={session?.user ? {
                    _id: session.user.id,
                    alias: session.user.alias,
                    email: session.user.email || ''
                  } : undefined}
                  onCallAction={handleCallAction}
                />
              );
            })}
          </div>

          {/* Typing Indicator */}
          {currentTypingUsers.length > 0 && (
            <TypingIndicator users={currentTypingUsers} />
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="relative z-10">
        <MessageInput
          onSendMessage={handleSendMessage}
          onStartTyping={handleStartTyping}
          onStopTyping={handleStopTyping}
          onInitiateCall={handleInitiateCall}
          onInputClick={handleInputClick}
          disabled={!isConnected}
          placeholder={
            !isConnected 
              ? "Connecting..." 
              : `Message ${otherParticipant?.alias}...`
          }
        />
      </div>
    </div>
  );
};