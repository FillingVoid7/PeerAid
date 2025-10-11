'use client';

import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  users: Array<{
    userId: string;
    alias: string;
    isTyping: boolean;
  }>;
  className?: string;
}

const TypingDots = () => (
  <div className="flex space-x-1">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users, className }) => {
  const typingUsers = users.filter(user => user.isTyping);
  
  if (typingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].alias} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].alias} and ${typingUsers[1].alias} are typing...`;
    } else {
      return `${typingUsers[0].alias} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className={cn("flex items-center gap-3 px-4 py-2", className)}>
      <Avatar className="w-6 h-6">
        <div className="bg-gradient-to-br from-gray-400 to-gray-600 w-full h-full flex items-center justify-center text-white text-xs font-medium">
          {typingUsers[0].alias.charAt(0).toUpperCase()}
        </div>
      </Avatar>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">{getTypingText()}</span>
        <TypingDots />
      </div>
    </div>
  );
};