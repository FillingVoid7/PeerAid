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
    const connectionRequest = new ConnectionRequest({
      fromUser: seekerProfile._id,
      toUser: guideProfile._id,
      message: message || "I'd like to connect and learn from your experience",
    });

    await connectionRequest.save();
    await this.notificationService.notifyGuideOfConnectionRequest(seekerProfile, guideProfile, connectionRequest);
    return connectionRequest;
  }
  
   // Guide accepts connection request 
  async acceptConnectionRequest(seekerId: Types.ObjectId, guideId: Types.ObjectId) {
    const { seekerProfile, guideProfile } = await getProfilesByIds(seekerId, guideId);

    const connectionRequest = await ConnectionRequest.findOne({
      fromUser: seekerProfile._id,  
      toUser: guideProfile._id,     
      status: 'pending',
    });

    if (!connectionRequest) {
      throw new Error('Connection request not found or already processed');
    }
    connectionRequest.status = 'accepted';
    await connectionRequest.save();
    await this.notificationService.notifySeekerOfAcceptedRequest(seekerProfile, guideProfile);
    return { connectionRequest };
  }

  
  async rejectConnectionRequest(seekerId: Types.ObjectId, guideId: Types.ObjectId) {
    const { seekerProfile, guideProfile } = await getProfilesByIds(seekerId, guideId);
    const connectionRequest = await ConnectionRequest.findOne({
      fromUser: seekerProfile._id,  
      toUser: guideProfile._id,     
      status: 'pending'
    });
    if (!connectionRequest) {
      throw new Error('Connection request not found or already processed');
    }
    connectionRequest.status = 'rejected';
    await connectionRequest.save();
    await this.notificationService.notifySeekerOfRejectedRequest(seekerProfile, guideProfile);
    return { connectionRequest };
  }
}

