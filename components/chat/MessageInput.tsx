'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Mic, MicOff, Phone, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'audio') => Promise<void>;
  onStartTyping: () => void;
  onStopTyping: () => void;
  onInitiateCall: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  onInitiateCall,
  disabled = false,
  placeholder = "Type a message...",
  className
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputClick = () => {
    console.log('Input clicked - this should work!');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicators
    if (value.length > 0) {
      onStartTyping();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping();
      }, 1000);
    } else {
      onStopTyping();
    }
  };

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending) return;

    setIsSending(true);
    onStopTyping();

    try {
      await onSendMessage(trimmedMessage, 'text');
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceRecording = useCallback(() => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // TODO: Implement actual voice recording logic
      console.log('Stopping voice recording...');
    } else {
      // Start recording
      setIsRecording(true);
      // TODO: Implement actual voice recording logic
      console.log('Starting voice recording...');
    }
  }, [isRecording]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div 
      className={cn(
        "relative flex items-end gap-2 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-10 pointer-events-auto",
        className
      )}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Attachment button */}
      <Button
        variant="ghost"
        size="icon"
        className="mb-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 pointer-events-auto z-10"
        disabled={disabled}
      >
        <Paperclip className="w-5 h-5" />
      </Button>

      {/* Message input area */}
      <div className="flex-1 flex items-end gap-2 relative z-10">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onClick={handleInputClick}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="min-h-[44px] py-3 pr-12 resize-none border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 relative z-10 pointer-events-auto"
            maxLength={1000}
          />
          
          {/* Emoji button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-20 pointer-events-auto"
            disabled={disabled}
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        {/* Voice recording button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "mb-1 transition-colors pointer-events-auto z-10",
            isRecording 
              ? "text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20" 
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          )}
          onClick={handleVoiceRecording}
          disabled={disabled}
        >
          {isRecording ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Send or Call button */}
      {message.trim() ? (
        <Button
          onClick={handleSendMessage}
          disabled={disabled || isSending || !message.trim()}
          className="mb-1 bg-blue-600 hover:bg-blue-700 text-white pointer-events-auto z-10"
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      ) : (
        <Button
          onClick={onInitiateCall}
          disabled={disabled}
          variant="ghost"
          size="icon"
          className="mb-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 pointer-events-auto z-10"
        >
          <Phone className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};