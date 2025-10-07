import { Types, Document } from 'mongoose';
import ConnectionRequest from '@/models/connectionRequest';
import { NotificationService } from './notificationService';
import { getValidatedSeeker, returnGuideProfile } from '../utilities/profileValidationService';
import { IHealthProfile } from '@/models/types/profile.type';

export async function getProfilesByIds(requestId: Types.ObjectId, guideId: Types.ObjectId): Promise<{
  seekerProfile: Document<unknown, {}, IHealthProfile> & IHealthProfile;
  guideProfile: Document<unknown, {}, IHealthProfile> & IHealthProfile;
}> {
  const [seekerProfile, guideProfile] = await Promise.all([
    getValidatedSeeker(requestId),
    returnGuideProfile(guideId),
  ]);
  return { seekerProfile, guideProfile };
}


export class ConnectionService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

   // Send connection request from seeker to guide
  async sendConnectionRequest(requestId: Types.ObjectId, guideId: Types.ObjectId, message?: string) {
    const { seekerProfile, guideProfile } = await getProfilesByIds(requestId, guideId);
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUser: seekerProfile.userId, toUser: guideProfile.userId, status: 'pending' },
        { fromUser: guideProfile.userId, toUser: seekerProfile.userId, status: 'pending' }
      ]
    });
    
    console.log('ConnectionService - existing request check:', existingRequest ? 'found' : 'not found');
    
    if (existingRequest) {
      throw new Error('A pending connection request already exists between these users');
    }
    
    const connectionRequest = new ConnectionRequest({
      fromUser: seekerProfile.userId,  
      toUser: guideProfile.userId,     
      message: message || "I'd like to connect and learn from your experience",
      status: 'pending'
    });

    console.log('ConnectionService - creating request with:');
    console.log('  fromUser (User ID):', seekerProfile.userId);
    console.log('  toUser (User ID):', guideProfile.userId);

    try {
      await connectionRequest.save();
      console.log('ConnectionService - request saved successfully:', connectionRequest._id);
      await this.notificationService.notifyGuideOfConnectionRequest(seekerProfile, guideProfile, connectionRequest);
      return connectionRequest;
    } catch (error: any) {
      console.error('ConnectionService - save error:', error);
      if (error.code === 11000) {
        throw new Error('A pending connection request already exists between these users');
      }
      throw error;
    }
  }
  
   // Accept connection request by requestId
  async acceptConnectionRequest(requestId: string, userId: Types.ObjectId) {
    const connectionRequest = await ConnectionRequest.findById(requestId)
      .populate('fromUser')
      .populate('toUser');

    if (!connectionRequest) {
      throw new Error('Connection request not found');
    }

    if (connectionRequest.toUser._id.toString() !== userId.toString()) {
      throw new Error('Unauthorized to accept this request');
    }

    if (connectionRequest.status !== 'pending') {
      throw new Error('Connection request already processed');
    }

    connectionRequest.status = 'accepted';
    await connectionRequest.save();
    
    await this.notificationService.notifySeekerOfAcceptedRequest(
      connectionRequest.fromUser, 
      connectionRequest.toUser
    );
    
    return { connectionRequest };
  }

  
  async rejectConnectionRequest(requestId: string, userId: Types.ObjectId) {
    const connectionRequest = await ConnectionRequest.findById(requestId)
      .populate('fromUser')
      .populate('toUser');

    if (!connectionRequest) {
      throw new Error('Connection request not found');
    }

    if (connectionRequest.toUser._id.toString() !== userId.toString()) {
      throw new Error('Unauthorized to reject this request');
    }

    if (connectionRequest.status !== 'pending') {
      throw new Error('Connection request already processed');
    }

    connectionRequest.status = 'rejected';
    await connectionRequest.save();
    
    await this.notificationService.notifySeekerOfRejectedRequest(
      connectionRequest.fromUser, 
      connectionRequest.toUser
    );
    
    return { connectionRequest };
  }
}

