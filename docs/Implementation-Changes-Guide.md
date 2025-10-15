### 1. Call Initiation Flow
```
User Clicks Call Button
        ↓
ChatInterface.handleInitiateCall()
        ↓
ChatContext.initiateAudioCall()
        ↓
Generate callId + Set State
        ↓
AudioCall Component Renders
        ↓
AudioCall.initializePeerConnection()
        ↓
Create WebRTC Offer
        ↓
wsClient.initiateAudioCall(offer)
        ↓
WebSocket Server
        ↓
Peer receives 'audio_call_incoming'
        ↓
Peer's AudioCall shows incoming call UI
```

### 2. Call Answer Flow
```
Peer Clicks Answer Button
        ↓
AudioCall.handleAnswer()
        ↓
ChatContext.answerAudioCall()
        ↓
Set State: 'connecting'
        ↓
AudioCall.initializePeerConnection()
        ↓
AudioCall.handleIncomingOffer()
        ↓
Set Remote Description + Create Answer
        ↓
wsClient.answerAudioCall(answer)
        ↓
WebSocket Server
        ↓
Caller receives 'audio_call_answered'
        ↓
Caller's AudioCall.handleIncomingAnswer()
        ↓
WebRTC Connection Established
        ↓
Both sides: State 'connected'
```

### 3. ICE Candidate Exchange
```
PeerConnection generates ICE candidate
        ↓
peerConnection.onicecandidate
        ↓
wsClient.sendIceCandidate()
        ↓
WebSocket Server
        ↓
Peer receives 'ice_candidate'
        ↓
AudioCall.handleIceCandidate()
        ↓
peerConnection.addIceCandidate()
        ↓
Connection optimization continues
```

### Outgoing Call Flow : 

1. User clicks call button
   ↓
2. initiateAudioCall() called
   ↓
3. State: { callId: "abc123", isIncoming: false, status: 'ringing' }
   ↓
4. AudioCall component creates WebRTC offer
   ↓
5. Other person sees incoming call
   ↓
6. They call answerAudioCall() or rejectAudioCall()
   ↓
7. WebRTC connection established or call ends


### Incoming Call Flow:

1. WebSocket receives 'audio_call_incoming'
   ↓
2. Context sets state: { isIncoming: true, status: 'ringing' }
   ↓
3. User sees incoming call UI
   ↓
4. User clicks Answer → answerAudioCall()
   ↓
5. State updates to 'connecting'
   ↓
6. AudioCall component handles WebRTC answer
   ↓
7. setAudioCallState({ status: 'connected' })