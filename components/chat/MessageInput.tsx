'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Mic, MicOff, Phone, Paperclip, Smile, X, FileText, Image as ImageIcon, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'audio' | 'file', fileData?: any) => Promise<void>;
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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputClick = () => {
    console.log('[READ] Input area clicked - marking messages as read');
    onInputClick?.();
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const emojiCategories = {
    recent: ['😀', '😂', '❤️', '👍', '👎', '😊', '😢', '😮'],
    smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
    gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣'],
  };

  const handleEmojiClick = (emoji: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newMessage);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
      
      if (newMessage.length > 0) {
        onStartTyping();
        
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          onStopTyping();
        }, 1000);
      }
    }
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

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
    if ((!trimmedMessage && !selectedFile) || isSending) return;

    setIsSending(true);
    onStopTyping();

    try {
      if (selectedFile) {
        await handleFileUpload();
      } else {
        await onSendMessage(trimmedMessage, 'text');
        setMessage('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setMessage(`📎 ${file.name}`);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getMediaType = (file: File): string => {
    if (file.type.startsWith('image/')) {
      return 'image';
    } else if (file.type === 'application/pdf' || 
               file.type === 'application/msword' || 
               file.type.includes('wordprocessingml')) {
      return 'document';
    } else if (file.type.includes('zip') || 
               file.type.includes('rar') || 
               file.type.includes('7z')) {
      return 'archive';
    }
    return 'document'; 
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    } else if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z')) {
      return <Archive className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('mediaType', getMediaType(selectedFile));

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch('/api/chat/upload-files', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadResult = await response.json();
      
      await onSendMessage(
        `📎 ${selectedFile.name}`,
        'file',
        {
          fileUrl: uploadResult.permanentUrl,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
          fileExtension: uploadResult.fileExtension,
        }
      );

      setSelectedFile(null);
      setMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('File upload failed:', error);
      toast.error('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
        "relative flex flex-col gap-2 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-10 pointer-events-auto",
        className
      )}
      style={{ pointerEvents: 'auto' }}
    >
      {/* File upload input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx,.zip,.rar,.7z"
        className="hidden"
      />

      {/* File preview */}
      {selectedFile && (
        <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md border">
          <div className="flex items-center gap-2 flex-1">
            {getFileIcon(selectedFile)}
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {selectedFile.name}
            </span>
            <span className="text-xs text-gray-500">
              ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveFile}
            className="h-6 w-6 text-gray-500 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Quick emoji suggestions */}
      {message.length > 0 && !selectedFile && (
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Quick:</span>
          {emojiCategories.recent.slice(0, 6).map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleEmojiClick(emoji)}
              className="w-6 h-6 flex items-center justify-center text-sm hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              title={`Add ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFileSelect}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 pointer-events-auto z-10 self-center"
          disabled={disabled || isUploading}
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
              placeholder={selectedFile ? `Send ${selectedFile.name}` : placeholder}
              disabled={disabled || isSending || isUploading}
              className="w-full min-h-[44px] max-h-[120px] py-3 pr-12 px-3 resize-none border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 relative z-10 pointer-events-auto focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 overflow-y-auto"
              maxLength={1000}
              rows={1}
              readOnly={!!selectedFile}
            />
            
            {/* Emoji button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleEmojiPicker}
              className={cn(
                "absolute right-2 top-3 z-20 pointer-events-auto",
                showEmojiPicker ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
              disabled={disabled || !!selectedFile}
            >
              <Smile className="w-4 h-4" />
            </Button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-full right-0 mb-2 w-80 max-h-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 overflow-hidden"
              >
                <div className="p-3">
                  <div className="flex gap-2 mb-3 overflow-x-auto">
                    {Object.keys(emojiCategories).map((category) => (
                      <button
                        key={category}
                        className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 capitalize whitespace-nowrap"
                        onClick={() => {
                          const element = document.getElementById(`emoji-category-${category}`);
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {Object.entries(emojiCategories).map(([category, emojis]) => (
                      <div key={category} id={`emoji-category-${category}`} className="mb-4">
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 capitalize">
                          {category}
                        </h4>
                        <div className="grid grid-cols-8 gap-1">
                          {emojis.map((emoji, index) => (
                            <button
                              key={`${category}-${index}`}
                              onClick={() => handleEmojiClick(emoji)}
                              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              title={emoji}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSendMessage}
          disabled={disabled || isSending || isUploading || (!message.trim() && !selectedFile)}
          className="bg-blue-500 hover:bg-blue-600 text-white pointer-events-auto z-10 self-center"
          size="icon"
        >
          {isSending || isUploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};