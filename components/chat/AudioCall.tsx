'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useChat } from '@/lib/chat-context';
import { wsClient } from '@/lib/websocket-client';

interface AudioCallProps {
  className?: string;
}

export const AudioCall: React.FC<AudioCallProps> = ({ className }) => {
  const { audioCall, currentConversation, answerAudioCall, rejectAudioCall, endAudioCall, setAudioCallState } = useChat();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [remoteOffer, setRemoteOffer] = useState<RTCSessionDescriptionInit | null>(null);

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
        if (event.candidate && audioCall.callId && currentConversation) {
          wsClient.sendIceCandidate(currentConversation._id, audioCall.callId, event.candidate);
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        switch (peerConnection.connectionState) {
          case 'connected':
            setAudioCallState({ status: 'connected' });
            startCallTimer();
            break;
          case 'disconnected':
          case 'failed':
          case 'closed':
            setAudioCallState({ status: 'ended', isActive: false });
            cleanup();
            break;
        }
      };

      return peerConnection;
    } catch (error) {
      console.error('Error initializing peer connection:', error);
      setAudioCallState({ status: 'ended', isActive: false });
      throw error;
    }
  }, [audioCall.callId, currentConversation, setAudioCallState]);

  const startCallTimer = useCallback(() => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = useCallback(async () => {
    try {
      await answerAudioCall(audioCall.callId!);
      setAudioCallState({ status: 'connecting' });
      await initializePeerConnection();
    } catch (error) {
      console.error('Error answering call:', error);
      setAudioCallState({ status: 'ended', isActive: false });
    }
  }, [answerAudioCall, audioCall.callId, initializePeerConnection, setAudioCallState]);

  const handleReject = useCallback(async () => {
    try {
      await rejectAudioCall(audioCall.callId!);
      cleanup();
    } catch (error) {
      console.error('Error rejecting call:', error);
      setAudioCallState({ status: 'ended', isActive: false });
    }
  }, [rejectAudioCall, audioCall.callId]);

  const handleEnd = useCallback(async () => {
    try {
      await endAudioCall(audioCall.callId!);
      cleanup();
    } catch (error) {
      console.error('Error ending call:', error);
      setAudioCallState({ status: 'ended', isActive: false });
    }
  }, [endAudioCall, audioCall.callId]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  }, [isMuted]);

  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn(!isSpeakerOn);
  }, [isSpeakerOn]);

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

  const handleIncomingOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) {
      await initializePeerConnection();
    }
    
    try {
      await peerConnectionRef.current!.setRemoteDescription(offer);
      const answer = await peerConnectionRef.current!.createAnswer();
      await peerConnectionRef.current!.setLocalDescription(answer);
      
      // Send answer via WebSocket
      if (audioCall.callId && currentConversation) {
        wsClient.answerAudioCall(currentConversation._id, audioCall.callId, answer);
      }
    } catch (error) {
      console.error('Error handling incoming offer:', error);
    }
  }, [initializePeerConnection, audioCall.callId, currentConversation]);

  const handleIncomingAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (peerConnectionRef.current) {
      try {
        await peerConnectionRef.current.setRemoteDescription(answer);
      } catch (error) {
        console.error('Error handling incoming answer:', error);
      }
    }
  }, []);

  const handleIceCandidate = useCallback((candidate: RTCIceCandidate) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.addIceCandidate(candidate).catch(console.error);
    }
  }, []);

  // Setup WebSocket event listeners
  useEffect(() => {
    if (!audioCall.isActive || !audioCall.callId) return;

    const handleAudioCallIncoming = (data: any) => {
      if (data.callId === audioCall.callId && data.offer) {
        setRemoteOffer(data.offer);
      }
    };

    const handleAudioCallAnswered = (data: any) => {
      if (data.callId === audioCall.callId && data.answer) {
        handleIncomingAnswer(data.answer);
      }
    };

    const handleIceCandidate = (data: any) => {
      if (data.callId === audioCall.callId && data.candidate) {
        handleIceCandidate(data.candidate);
      }
    };

    wsClient.on('audio_call_incoming', handleAudioCallIncoming);
    wsClient.on('audio_call_answered', handleAudioCallAnswered);
    wsClient.on('ice_candidate', handleIceCandidate);

    return () => {
      wsClient.off('audio_call_incoming', handleAudioCallIncoming);
      wsClient.off('audio_call_answered', handleAudioCallAnswered);
      wsClient.off('ice_candidate', handleIceCandidate);
    };
  }, [audioCall.isActive, audioCall.callId, handleIncomingAnswer, handleIceCandidate]);

  // Initialize call for outgoing calls
  useEffect(() => {
    if (!audioCall.isIncoming && audioCall.status === 'ringing' && currentConversation) {
      initializePeerConnection().then(async (peerConnection) => {
        try {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          
          // Send offer via WebSocket
          wsClient.initiateAudioCall(currentConversation._id, audioCall.callId!, offer);
        } catch (error) {
          console.error('Error creating offer:', error);
        }
      }).catch(error => {
        console.error('Error initializing outgoing call:', error);
        setAudioCallState({ status: 'ended', isActive: false });
      });
    }
  }, [audioCall.isIncoming, audioCall.status, audioCall.callId, currentConversation, initializePeerConnection, setAudioCallState]);

  // Handle incoming offer when available
  useEffect(() => {
    if (remoteOffer && audioCall.isIncoming && audioCall.status === 'ringing') {
      handleIncomingOffer(remoteOffer);
    }
  }, [remoteOffer, audioCall.isIncoming, audioCall.status, handleIncomingOffer]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  if (!audioCall.isActive || audioCall.status === 'ended') {
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
                {audioCall.participant?.alias?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Avatar>
            
            <div>
              <h2 className="text-xl font-semibold">{audioCall.participant?.alias || 'Unknown'}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    audioCall.status === 'ringing' && "bg-yellow-500/20 text-yellow-100",
                    audioCall.status === 'connecting' && "bg-blue-500/20 text-blue-100",
                    audioCall.status === 'connected' && "bg-green-500/20 text-green-100"
                  )}
                >
                  {audioCall.status === 'ringing' && (audioCall.isIncoming ? 'Incoming call...' : 'Calling...')}
                  {audioCall.status === 'connecting' && 'Connecting...'}
                  {audioCall.status === 'connected' && formatDuration(callDuration)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex justify-center gap-4">
            {audioCall.status === 'ringing' && audioCall.isIncoming ? (
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
            ) : audioCall.status === 'connected' ? (
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