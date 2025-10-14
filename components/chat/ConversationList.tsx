'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Plus, MessageCircle, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat, type ChatConversation } from '@/lib/chat-context';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  onSelectConversation: (conversation: ChatConversation) => void;
  selectedConversationId?: string;
  className?: string;
}

const ConversationItem: React.FC<{
  conversation: ChatConversation;
  isSelected: boolean;
  currentUserId?: string;
  onSelect: () => void;
  isOnline?: boolean;
}> = ({ conversation, isSelected, currentUserId, onSelect, isOnline }) => {
  // Determine the other participant
  const otherParticipant = conversation.participants.seeker._id === currentUserId
    ? conversation.participants.guide
    : conversation.participants.seeker;

  // Only show unread count if there are unread messages from the other participant
  const unreadCount = conversation.unreadCount && conversation.unreadCount > 0 ? conversation.unreadCount : 0;

  return (
    <Card
      className={cn(
        "p-3 mb-2 cursor-pointer transition-all hover:shadow-md border-l-4",
        isSelected 
          ? "bg-blue-50 dark:bg-blue-900/20 border-l-blue-500 shadow-md" 
          : "border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-12 h-12">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center text-white font-medium">
              {otherParticipant.alias.charAt(0).toUpperCase()}
            </div>
          </Avatar>
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {otherParticipant.alias}
            </h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs min-w-[20px] h-5 rounded-full px-1.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {conversation.lastMessage 
              ? (typeof conversation.lastMessage === 'string' 
                  ? conversation.lastMessage.trim() 
                  : (conversation.lastMessage as any)?.content?.trim() || 'New message')
              : 'No messages yet'}
          </p>

          <div className="flex items-center justify-between mt-2">
            {/* Only show Active status if user is online */}
            {isOnline && (
              <Badge 
                variant="secondary"
                className="text-xs"
              >
                Active
              </Badge>
            )}
            {!isOnline && <div></div>} {/* Empty div to maintain layout */}
            
            {/* <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-gray-400 hover:text-green-600"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle call
                }}
              >
                <Phone className="w-3 h-3" />
              </Button>
            </div> */}
          </div>
        </div>
      </div>
    </Card>
  );
};

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  selectedConversationId,
  className
}) => {
  const { data: session } = useSession();
  const { 
    conversations, 
    isLoadingConversations, 
    loadConversations, 
    onlineUsers,
    isConnected 
  } = useChat();
  
  const [filteredConversations, setFilteredConversations] = useState<ChatConversation[]>([]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Set conversations directly without filtering
  useEffect(() => {
    setFilteredConversations(conversations);
  }, [conversations]);

  const handleSelectConversation = (conversation: ChatConversation) => {
    onSelectConversation(conversation);
  };

  // Check if a user is online
  const isUserOnline = (userId: string, conversationId: string) => {
    return onlineUsers.some(
      user => user.userId === userId && 
               user.conversationId === conversationId && 
               user.isOnline
    );
  };

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-gray-900", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Conversations
          </h1>
        </div>
      </div>


      {/* Conversations List */}
      <ScrollArea className="flex-1 p-4">
        {isLoadingConversations && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No conversations yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center">
              Start a conversation with your connections
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map(conversation => {
              const otherParticipant = conversation.participants.seeker._id === session?.user?.id
                ? conversation.participants.guide
                : conversation.participants.seeker;

              const isOnline = isUserOnline(otherParticipant._id, conversation._id);

              return (
                <ConversationItem
                  key={conversation._id}
                  conversation={conversation}
                  isSelected={selectedConversationId === conversation._id}
                  currentUserId={session?.user?.id}
                  onSelect={() => handleSelectConversation(conversation)}
                  isOnline={isOnline}
                />
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};