import { Types } from 'mongoose';
import HealthProfile from '@/models/healthProfile';
import ConnectionRequest, { IConnectionRequest } from '@/models/connectionRequest';
import { MatchingService } from './matchingService';

export class ConnectionService {
   // Send connection request from seeker to guide
    
  async sendConnectionRequest(seekerId: Types.ObjectId, guideId: Types.ObjectId, message?: string) {
    // Check if profiles exist and have correct roles
    const [seekerProfile, guideProfile] = await Promise.all([
      HealthProfile.findOne({ userId: seekerId, role: 'seeker' }),
      HealthProfile.findOne({ userId: guideId, role: 'guide' })
    ]);

    if (!seekerProfile || !guideProfile) {
      throw new Error('Invalid user roles for connection');
    }

    // Calculate match score for context
    const matchingService = new MatchingService();
    const matchResult = await matchingService.calculateMatchScore(seekerProfile, guideProfile);

    // Create connection request
    const connectionRequest = new ConnectionRequest({
      fromUser: seekerId,
      toUser: guideId,
      message: message || "I'd like to connect and learn from your experience",
      sharedSymptoms: matchResult.sharedSymptoms,
      matchScore: matchResult.matchScore
    });

    await connectionRequest.save();

    // Send notification to guide (email/push)
    // await this.notifyGuideOfConnectionRequest(guideId, seekerId, connectionRequest);

    return connectionRequest;
  }
  
   // Guide accepts connection request
   
  async acceptConnectionRequest(requestId: Types.ObjectId, guideId: Types.ObjectId) {
    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUser: guideId,
      status: 'pending'
    });

    if (!connectionRequest) {
      throw new Error('Connection request not found or already processed');
    }

    // Update request status
    connectionRequest.status = 'accepted';
    await connectionRequest.save();

    // Create chat conversation
    const [seekerProfile, guideProfile] = await Promise.all([
      HealthProfile.findOne({ userId: connectionRequest.fromUser }),
      HealthProfile.findOne({ userId: connectionRequest.toUser })
    ]);



    // Notify seeker
    // await this.notifySeekerOfAcceptedRequest(connectionRequest.fromUser, guideId);

    return { connectionRequest };
  }

  /**
   * Get all pending connection requests for a user
   */
  async getPendingRequests(userId: Types.ObjectId, role: 'seeker' | 'guide') {
    const query = role === 'guide' 
      ? { toUser: userId, status: 'pending' }
      : { fromUser: userId, status: 'pending' };

    return await ConnectionRequest.find(query)
      .populate(role === 'guide' ? 'fromUser' : 'toUser', 'randomUsername displayName showProfile avatar')
      .sort({ createdAt: -1 });
  }

}

/*
┌─────────────────────────────────────────────┐
│               User Dashboard                │
├─────────────────────────────────────────────┤
│ 1. Pending Connection Requests (2)          │
│ 2. Active Conversations (3)                 │
│ 3. New Match Suggestions                    │
│ 4. Connection Statistics                    │
└─────────────────────────────────────────────┘

*/