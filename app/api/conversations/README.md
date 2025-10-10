# Conversation API Endpoints

This directory contains the API endpoints for managing conversations and messages in the PeerAid application.

## Available Endpoints

### 1. Create or Get Conversation
**POST** `/api/conversations`

Creates a new conversation or returns an existing one between a seeker and guide.

**Request Body:**
```json
{
  "seekerId": "string",
  "guideId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "conversation": {
    "_id": "string",
    "participants": {
      "seeker": { "_id": "string", "alias": "string", "email": "string" },
      "guide": { "_id": "string", "alias": "string", "email": "string" }
    },
    "status": "active",
    "lastMessage": "ObjectId or null",
    "createdAt": "Date",
    "updatedAt": "Date"
  }
}
```

### 2. Get Conversation Messages
**GET** `/api/conversations/[conversationId]/messages`

Retrieves paginated messages for a specific conversation.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "_id": "string",
      "conversationId": "string",
      "sender": { "_id": "string", "alias": "string", "email": "string" },
      "type": "text|image|audio|system|audio_invite|audio_accept|audio_reject",
      "content": "string",
      "fileUrl": "string (optional)",
      "duration": "number (optional)",
      "status": "sent|delivered|read",
      "readBy": ["userId1", "userId2"],
      "audioCallId": "string (optional)",
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ],
  "page": 1,
  "hasMore": true
}
```

### 3. Mark Messages as Read
**PUT** `/api/conversations/[conversationId]/messages/read`

Marks multiple messages as read by a specific user.

**Request Body:**
```json
{
  "userId": "string",
  "messageIds": ["messageId1", "messageId2", "..."]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

### 4. Get User's Conversations
**GET** `/api/users/[userId]/conversations`

Retrieves all conversations for a specific user (both as seeker and guide).

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "_id": "string",
      "participants": {
        "seeker": { "_id": "string", "alias": "string", "email": "string" },
        "guide": { "_id": "string", "alias": "string", "email": "string" }
      },
      "status": "active|inactive",
      "lastMessage": {
        "_id": "string",
        "content": "string",
        "type": "text",
        "createdAt": "Date"
      },
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ]
}
```

### 5. Get Online Users in Conversation
**GET** `/api/conversations/[conversationId]/online-users`

Returns the list of users currently online in a specific conversation.

**Response:**
```json
{
  "success": true,
  "conversationId": "string",
  "onlineUsers": ["userId1", "userId2"]
}
```

## WebSocket Integration

These API endpoints are designed to work alongside the WebSocket server for real-time functionality:

- The WebSocket server handles real-time message delivery
- The API endpoints handle persistent storage and retrieval
- The `websocket-client.ts` helper provides integration between the two

## Environment Variables

Make sure to set the following environment variable for WebSocket integration:

```env
WEBSOCKET_SERVER_URL=http://localhost:3001
```

## Usage Examples

### Frontend Integration

```typescript
// Create or get conversation
const response = await fetch('/api/conversations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ seekerId: 'user1', guideId: 'user2' })
});

// Get messages with pagination
const messages = await fetch('/api/conversations/conv123/messages?page=1&limit=20');

// Mark messages as read
await fetch('/api/conversations/conv123/messages/read', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    userId: 'user1', 
    messageIds: ['msg1', 'msg2'] 
  })
});

// Get user's conversations
const conversations = await fetch('/api/users/user123/conversations');

// Check online users
const onlineUsers = await fetch('/api/conversations/conv123/online-users');
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message description",
  "status": 400|500
}
```

Common error scenarios:
- 400: Bad Request (missing required fields)
- 500: Internal Server Error (database or server issues)