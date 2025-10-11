'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AudioCallProps {
  callId: string;
  isIncoming: boolean;
  participantName: string;
  participantAvatar?: string;
  onAnswer?: () => void;
  onReject?: () => void;
  onEnd?: () => void;
  className?: string;
}

type CallState = 'ringing' | 'connecting' | 'connected' | 'ended';

export const AudioCall: React.FC<AudioCallProps> = ({
  callId,
  isIncoming,
  participantName,
  participantAvatar,
  onAnswer,
  onReject,
  onEnd,
  className
}) => {
  const [callState, setCallState] = useState<CallState>(isIncoming ? 'ringing' : 'connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebRTC connection
  const initializePeerConnection = useCallback(async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      localStreamRef.current = stream;
      
      // Create peer connection
      const configuration: RTCConfiguration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      };
      
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate via WebSocket
          console.log('ICE candidate:', event.candidate);
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        switch (peerConnection.connectionState) {
          case 'connected':
            setCallState('connected');
            startCallTimer();
            break;
          case 'disconnected':
          case 'failed':
          case 'closed':
            setCallState('ended');
            cleanup();
            break;
        }
      };

      return peerConnection;
    } catch (error) {
      console.error('Error initializing peer connection:', error);
      throw error;
    }
  }, []);

  // Start call timer
  const startCallTimer = useCallback(() => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer call
  const handleAnswer = useCallback(async () => {
    try {
      setCallState('connecting');
      await initializePeerConnection();
      onAnswer?.();
    } catch (error) {
      console.error('Error answering call:', error);
      setCallState('ended');
    }
  }, [initializePeerConnection, onAnswer]);

  // Handle reject call
  const handleReject = useCallback(() => {
    setCallState('ended');
    cleanup();
    onReject?.();
  }, [onReject]);

  // Handle end call
  const handleEnd = useCallback(() => {
    setCallState('ended');
    cleanup();
    onEnd?.();
  }, [onEnd]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  }, [isMuted]);

  // Toggle speaker
  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn(!isSpeakerOn);
    // Note: Speaker control is limited in web browsers
    // This would primarily be visual feedback
  }, [isSpeakerOn]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  }, []);

  // Initialize call for outgoing calls
  useEffect(() => {
    if (!isIncoming && callState === 'connecting') {
      initializePeerConnection().catch(error => {
        console.error('Error initializing outgoing call:', error);
        setCallState('ended');
      });
    }
  }, [isIncoming, callState, initializePeerConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  if (callState === 'ended') {
    return null;
  }

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/50", className)}>
      <Card className="w-full max-w-sm mx-4 p-6 bg-gradient-to-br from-blue-600 to-purple-700 text-white border-0">
        <div className="text-center space-y-6">
          {/* Participant Info */}
          <div className="space-y-3">
            <Avatar className="w-24 h-24 mx-auto ring-4 ring-white/20">
              <div className="bg-gradient-to-br from-white/20 to-white/10 w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                {participantName.charAt(0).toUpperCase()}
              </div>
            </Avatar>
            
            <div>
              <h2 className="text-xl font-semibold">{participantName}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    callState === 'ringing' && "bg-yellow-500/20 text-yellow-100",
                    callState === 'connecting' && "bg-blue-500/20 text-blue-100",
                    callState === 'connected' && "bg-green-500/20 text-green-100"
                  )}
                >
                  {callState === 'ringing' && (isIncoming ? 'Incoming call...' : 'Calling...')}
                  {callState === 'connecting' && 'Connecting...'}
                  {callState === 'connected' && formatDuration(callDuration)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex justify-center gap-4">
            {callState === 'ringing' && isIncoming ? (
              <>
                <Button
                  onClick={handleAnswer}
                  className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg"
                >
                  <Phone className="w-6 h-6" />
                </Button>
                <Button
                  onClick={handleReject}
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </>
            ) : callState === 'connected' ? (
              <>
                <Button
                  onClick={toggleMute}
                  variant="outline"
                  className={cn(
                    "w-12 h-12 rounded-full text-white border-white/30",
                    isMuted ? "bg-red-500/20" : "bg-white/10"
                  )}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                
                <Button
                  onClick={toggleSpeaker}
                  variant="outline"
                  className={cn(
                    "w-12 h-12 rounded-full text-white border-white/30",
                    isSpeakerOn ? "bg-blue-500/20" : "bg-white/10"
                  )}
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </Button>
                
                <Button
                  onClick={handleEnd}
                  className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </>
            ) : (
              <Button
                onClick={handleEnd}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            )}
          </div>

          {/* Audio Elements */}
          <div className="hidden">
            <audio ref={localAudioRef} autoPlay muted />
            <audio ref={remoteAudioRef} autoPlay />
          </div>
        </div>
      </Card>
    </div>
  );
};