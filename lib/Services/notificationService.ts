import { Types } from 'mongoose';

export interface NotificationData {
  type: 'connection_request' | 'connection_accepted' | 'connection_rejected';
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  data?: any;
}

export class NotificationService {
  async notifyGuideOfConnectionRequest(seekerProfile: any, guideProfile: any, connectionRequest: any) {
    try {
      const seeker = seekerProfile;
      const guide = guideProfile;

      const notificationData = {
        type: 'connection_request' as const,
        fromUserId: seeker._id,
        toUserId: guide._id,
        data: { connectionRequest }
      };
      
      return notificationData;
      
    } catch (error) {
      console.error('Error sending guide notification:', error);
    }
  }


  async notifySeekerOfAcceptedRequest(seekerProfile:any , guideProfile:any) {
    try {
      const seekerId = seekerProfile._id;
      const guideId = guideProfile._id;

      const notificationData = {
        type: 'connection_accepted' as const,
        fromUserId: guideId,
        toUserId: seekerId,
      };

      return notificationData;
    } catch (error) {
      console.error('Error sending seeker notification:', error);
    }
  }


  async notifySeekerOfRejectedRequest(seekerProfile:any , guideProfile:any) {
    try {
      const seeker = seekerProfile;
      const guide = guideProfile;
      const notificationData = {
        type: 'connection_rejected' as const,
        fromUserId: guide._id,
        toUserId: seeker._id,
      };

      return notificationData;
    } catch (error) {
      console.error('Error sending rejection notification:', error);
    }
  }

}
  