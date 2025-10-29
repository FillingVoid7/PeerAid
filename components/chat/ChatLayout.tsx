'use client';

import React, { useState } from 'react';
import { ChatProvider, useChat, type ChatConversation } from '@/lib/chat-context';
import { ConversationList } from './ConversationList';
import { ChatInterface } from './ChatInterface';
import { cn } from '@/lib/utils';

interface ChatLayoutProps {
  className?: string;
}

const ChatLayoutContent: React.FC<ChatLayoutProps> = ({ className }) => {
  const { setCurrentConversation, currentConversation } = useChat();
  const [isMobileViewOpen, setIsMobileViewOpen] = useState(false);

  const handleSelectConversation = (conversation: ChatConversation) => {
    setCurrentConversation(conversation);
    setIsMobileViewOpen(true); 
  };

  const handleBackToList = () => {
    setIsMobileViewOpen(false);
    setCurrentConversation(null);
  };

  return (
    <div className={cn("flex h-full bg-gray-50 dark:bg-gray-900", className)}>
      <div className={cn(
        "w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-700",
        isMobileViewOpen ? "hidden md:block" : "block"
      )}>
        <ConversationList
          onSelectConversation={handleSelectConversation}
          selectedConversationId={currentConversation?._id}
        />
      </div>

      <div className={cn(
        "flex-1",
        !isMobileViewOpen && !currentConversation ? "hidden md:block" : "block"
      )}>
        <ChatInterface onBack={handleBackToList} />
      </div>
    </div>
  );
};

export const ChatLayout: React.FC<ChatLayoutProps> = ({ className }) => {
  return (
    <ChatProvider>
      <ChatLayoutContent className={className} />
    </ChatProvider>
  );
};