'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Play, Pause, Phone, PhoneCall, PhoneOff, Volume2, Check, CheckCheck, Download, FileText, Image as ImageIcon, Archive } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ChatMessage, ChatUser } from '@/lib/chat-context';

interface MessageProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  currentUser?: ChatUser;
  onAudioPlay?: (messageId: string) => void;
  onCallAction?: (action: 'answer' | 'reject', callId?: string) => void;
}

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}hr`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  
  return formatDistanceToNow(date, { addSuffix: false }).replace(/about |over |almost /, '');
};

const MessageStatusIcon = ({ status, readBy }: { status: ChatMessage['status']; readBy: string[] }) => {
  if (status === 'read' || (readBy && readBy.length > 0)) {
    return <CheckCheck className="w-3 h-3 text-blue-500" />;
  }
  if (status === 'delivered') {
    return <Check className="w-3 h-3 text-gray-400" />;
  }
  return <Check className="w-3 h-3 text-gray-300" />;
};

const TextMessage: React.FC<MessageProps> = ({ message, isOwnMessage, showAvatar }) => {
  return (
    <div className={cn(
      "flex gap-3 max-w-[85%] mb-2",
      isOwnMessage ? "ml-auto flex-row-reverse" : ""
    )}>
      {/* Avatar or spacer for alignment */}
      {!isOwnMessage && (
        <div className="w-8 h-8 flex-shrink-0 self-end">
          {showAvatar ? (
            <Avatar className="w-8 h-8">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center text-white text-sm font-medium">
                {message.sender.alias.charAt(0).toUpperCase()}
              </div>
            </Avatar>
          ) : (
            <div className="w-8 h-8"></div>
          )}
        </div>
      )}
      
      <div className={cn(
        "flex flex-col gap-1 min-w-0 flex-1",
        isOwnMessage ? "items-end" : "items-start"
      )}>        
        <Card className={cn(
          "px-3 py-2 max-w-full break-words inline-block",
          isOwnMessage 
            ? "bg-blue-600 text-white border-blue-600" 
            : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        </Card>
        
        <div className={cn(
          "flex items-center gap-1 px-1",
          isOwnMessage ? "flex-row-reverse" : ""
        )}>
          <span className="text-xs text-gray-500">
            {formatTimeAgo(new Date(message.createdAt))}
          </span>
          {isOwnMessage && (
            <MessageStatusIcon status={message.status} readBy={message.readBy || []} />
          )}
        </div>
      </div>
    </div>
  );
};

const AudioMessage: React.FC<MessageProps & { onAudioPlay?: (messageId: string) => void }> = ({ 
  message, 
  isOwnMessage, 
  showAvatar, 
  onAudioPlay
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayAudio = () => {
    setIsPlaying(!isPlaying);
    onAudioPlay?.(message._id);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "flex gap-3 max-w-[70%] mb-2",
      isOwnMessage ? "ml-auto flex-row-reverse" : ""
    )}>
      {/* Avatar or spacer for alignment */}
      {!isOwnMessage && (
        <div className="w-8 h-8 flex-shrink-0 self-end">
          {showAvatar ? (
            <Avatar className="w-8 h-8">
              <div className="bg-gradient-to-br from-green-500 to-teal-600 w-full h-full flex items-center justify-center text-white text-sm font-medium">
                {message.sender.alias.charAt(0).toUpperCase()}
              </div>
            </Avatar>
          ) : (
            <div className="w-8 h-8"></div>
          )}
        </div>
      )}
      
      <div className={cn(
        "flex flex-col gap-1",
        isOwnMessage ? "items-end" : "items-start"
      )}>
        {!isOwnMessage && showAvatar && (
          <span className="text-xs text-gray-500 px-2">{message.sender.alias}</span>
        )}
        
        <Card className={cn(
          "px-4 py-3 flex items-center gap-3",
          isOwnMessage 
            ? "bg-blue-600 text-white border-blue-600" 
            : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "w-8 h-8 rounded-full",
              isOwnMessage ? "hover:bg-blue-700 text-white" : "hover:bg-gray-100"
            )}
            onClick={handlePlayAudio}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 opacity-70" />
            <span className="text-sm">
              {message.duration ? formatDuration(message.duration) : '0:00'}
            </span>
          </div>
        </Card>
        
        <div className={cn(
          "flex items-center gap-1 px-2",
          isOwnMessage ? "flex-row-reverse" : ""
        )}>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
          {isOwnMessage && (
            <MessageStatusIcon status={message.status} readBy={message.readBy || []} />
          )}
        </div>
      </div>
    </div>
  );
};

const SystemMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
  return (
    <div className="flex justify-center my-2">
      <Badge variant="secondary" className="text-xs py-1 px-3">
        {message.content}
      </Badge>
    </div>
  );
};

const AudioCallMessage: React.FC<MessageProps & { onCallAction?: (action: 'answer' | 'reject', callId?: string) => void }> = ({ 
  message, 
  isOwnMessage, 
  showAvatar, 
  onCallAction
}) => {
  const getCallMessageContent = () => {
    switch (message.type) {
      case 'audio_invite':
        return isOwnMessage ? 'You started an audio call' : `${message.sender.alias} is calling...`;
      case 'audio_accept':
        return isOwnMessage ? 'You joined the call' : `${message.sender.alias} joined the call`;
      case 'audio_reject':
        return isOwnMessage ? 'You declined the call' : `${message.sender.alias} declined the call`;
      default:
        return message.content;
    }
  };

  const getCallIcon = () => {
    switch (message.type) {
      case 'audio_invite':
        return <PhoneCall className="w-4 h-4" />;
      case 'audio_accept':
        return <Phone className="w-4 h-4 text-green-500" />;
      case 'audio_reject':
        return <PhoneOff className="w-4 h-4 text-red-500" />;
      default:
        return <Phone className="w-4 h-4" />;
    }
  };

  const isIncomingCall = message.type === 'audio_invite' && !isOwnMessage;

  return (
    <div className={cn(
      "flex gap-3 max-w-[70%] mb-2",
      isOwnMessage ? "ml-auto flex-row-reverse" : ""
    )}>
      {/* Avatar or spacer for alignment */}
      {!isOwnMessage && (
        <div className="w-8 h-8 flex-shrink-0 self-end">
          {showAvatar ? (
            <Avatar className="w-8 h-8">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 w-full h-full flex items-center justify-center text-white text-sm font-medium">
                {message.sender.alias.charAt(0).toUpperCase()}
              </div>
            </Avatar>
          ) : (
            <div className="w-8 h-8"></div>
          )}
        </div>
      )}
      
      <div className={cn(
        "flex flex-col gap-1",
        isOwnMessage ? "items-end" : "items-start"
      )}>
        {!isOwnMessage && showAvatar && (
          <span className="text-xs text-gray-500 px-2">{message.sender.alias}</span>
        )}
        
        <Card className={cn(
          "px-4 py-3",
          isOwnMessage 
            ? "bg-blue-600 text-white border-blue-600" 
            : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700",
          isIncomingCall && "border-green-500 bg-green-50 dark:bg-green-900/20"
        )}>
          <div className="flex items-center gap-3">
            {getCallIcon()}
            <span className="text-sm">{getCallMessageContent()}</span>
          </div>
          
          {isIncomingCall && (
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onCallAction?.('answer', message.audioCallId)}
              >
                <Phone className="w-4 h-4 mr-1" />
                Answer
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => onCallAction?.('reject', message.audioCallId)}
              >
                <PhoneOff className="w-4 h-4 mr-1" />
                Decline
              </Button>
            </div>
          )}
        </Card>
        
        <div className={cn(
          "flex items-center gap-1 px-2",
          isOwnMessage ? "flex-row-reverse" : ""
        )}>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
          {isOwnMessage && (
            <MessageStatusIcon status={message.status} readBy={message.readBy || []} />
          )}
        </div>
      </div>
    </div>
  );
};

const FileMessage: React.FC<MessageProps> = ({ message, isOwnMessage, showAvatar }) => {
  const getFileIcon = (fileName: string | undefined, fileExtension: string | undefined) => {
    if (!fileName && !fileExtension) return <FileText className="w-6 h-6" />;
    
    const ext = fileExtension?.toLowerCase() || fileName?.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <ImageIcon className="w-6 h-6 text-blue-500" />;
    } else if (['zip', 'rar', '7z'].includes(ext || '')) {
      return <Archive className="w-6 h-6 text-orange-500" />;
    }
    return <FileText className="w-6 h-6 text-gray-500" />;
  };

  const formatFileSize = (size: number | undefined) => {
    if (!size) return '';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = () => {
    if (message.fileUrl) {
      window.open(message.fileUrl, '_blank');
    }
  };

  const isImageFile = (fileName: string | undefined, fileExtension: string | undefined) => {
    const ext = fileExtension?.toLowerCase() || fileName?.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  return (
    <div className={cn(
      "flex gap-3 max-w-[70%] mb-2",
      isOwnMessage ? "ml-auto flex-row-reverse" : ""
    )}>
      {showAvatar && !isOwnMessage && (
        <Avatar className="w-8 h-8 shrink-0 mt-1">
          <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium rounded-full">
            {message.sender.alias.charAt(0).toUpperCase()}
          </div>
        </Avatar>
      )}

      <div className={cn(
        "flex flex-col",
        isOwnMessage ? "items-end" : "items-start"
      )}>
        <Card className={cn(
          "p-3 shadow-sm border max-w-full",
          isOwnMessage 
            ? "bg-blue-500 text-white border-blue-600" 
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        )}>
          {/* File preview for images */}
          {isImageFile(message.fileName, message.fileExtension) && message.fileUrl && (
            <div className="mb-2">
              <img 
                src={message.fileUrl} 
                alt={message.fileName || 'Shared image'}
                className="max-w-[300px] max-h-[200px] object-cover rounded border cursor-pointer"
                onClick={() => window.open(message.fileUrl, '_blank')}
              />
            </div>
          )}

          {/* File info */}
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              {getFileIcon(message.fileName, message.fileExtension)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {message.fileName || 'Unknown file'}
              </div>
              {message.fileSize && (
                <div className={cn(
                  "text-xs mt-1",
                  isOwnMessage ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                )}>
                  {formatFileSize(message.fileSize)}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className={cn(
                "shrink-0 h-8 w-8",
                isOwnMessage 
                  ? "text-white hover:bg-blue-600" 
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              )}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>

          {message.content && message.content !== `📎 ${message.fileName}` && (
            <div className="mt-2 text-sm">
              {message.content}
            </div>
          )}
        </Card>
        
        <div className={cn(
          "flex items-center gap-1 px-1",
          isOwnMessage ? "flex-row-reverse" : ""
        )}>
          <span className="text-xs text-gray-500">
            {formatTimeAgo(new Date(message.createdAt))}
          </span>
          {isOwnMessage && (
            <MessageStatusIcon status={message.status} readBy={message.readBy || []} />
          )}
        </div>
      </div>
    </div>
  );
};

export const MessageBubble: React.FC<MessageProps> = (props) => {
  const { message } = props;

  switch (message.type) {
    case 'text':
      return <TextMessage {...props} />;
    case 'audio':
      return <AudioMessage {...props} />;
    case 'file':
      return <FileMessage {...props} />;
    case 'system':
      return <SystemMessage {...props} />;
    case 'audio_invite':
    case 'audio_accept':
    case 'audio_reject':
      return <AudioCallMessage {...props} />;
    default:
      return <TextMessage {...props} />;
  }
};