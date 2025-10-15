'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatProvider, useChat } from '@/lib/chat-context';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { DashboardNavigation } from '@/components/DashboardNavigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { ChatConversation } from '@/lib/chat-context';

const ChatPageContent = () => {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversation');
  const { setCurrentConversation, loadConversations, conversations, currentConversation } = useChat();
  const [isMobileViewOpen, setIsMobileViewOpen] = useState(false);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv._id === conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
        setIsMobileViewOpen(true); 
      } else {
        console.log(`Conversation ${conversationId} not found in loaded conversations`);
      }
    }
  }, [conversationId, conversations, setCurrentConversation]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!currentConversation && !conversationId && conversations.length > 0) {
      const latestConversation = conversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      
      if (latestConversation) {
        setCurrentConversation(latestConversation);
        setIsMobileViewOpen(true); 
      }
    }
  }, [currentConversation, conversationId, conversations, setCurrentConversation]);

  const handleSelectConversation = (conversation: ChatConversation) => {
    setCurrentConversation(conversation);
    setIsMobileViewOpen(true); 
  };

  const handleBackToList = () => {
    setIsMobileViewOpen(false);
    setCurrentConversation(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Navigation Bar */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <DashboardNavigation />
      </div>
      
      {/* Chat Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation List - Hidden on mobile when chat is open */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-700",
          isMobileViewOpen ? "hidden md:block" : "block"
        )}>
          <ConversationList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={currentConversation?._id}
          />
        </div>

        {/* Chat Interface - Hidden on mobile when no conversation selected */}
        <div className={cn(
          "flex-1",
          !isMobileViewOpen && !currentConversation ? "hidden md:block" : "block"
        )}>
          <ChatInterface onBack={handleBackToList} />
        </div>
      </div>
    </div>
  );
};

export default function ChatPage() {
  return (
    <React.Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
      <ChatProvider>
        <ChatPageContent />
      </ChatProvider>
    </React.Suspense>
  );
}