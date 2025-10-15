'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Mic, MicOff, Phone, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'audio') => Promise<void>;
  onStartTyping: () => void;
  onStopTyping: () => void;
  onInitiateCall: () => void;
  onInputClick?: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  onInitiateCall,
  onInputClick,
  disabled = false,
  placeholder = "Type a message...",
  className
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputClick = () => {
    console.log('[READ] Input area clicked - marking messages as read');
    onInputClick?.();
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    adjustTextareaHeight();

    if (value.length > 0) {
      onStartTyping();
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
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
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        handleSendMessage();
      }
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
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
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onClick={handleInputClick}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="w-full min-h-[44px] max-h-[120px] py-3 pr-12 px-3 resize-none border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 relative z-10 pointer-events-auto focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 overflow-y-auto"
            maxLength={1000}
            rows={1}
          />
          
          {/* Emoji button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-20 pointer-events-auto"
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