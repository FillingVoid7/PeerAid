import { Types } from 'mongoose';
import User from '@/models/User';
import HealthProfile from '@/models/healthProfile';
import { getValidatedSeeker, getValidatedGuide, findPotentialGuides } from './profileValidationService';

export interface NotificationData {
  type: 'connection_request' | 'connection_accepted' | 'connection_rejected';
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  data?: any;
}

export class NotificationService {
  async notifyGuideOfConnectionRequest(guideId: Types.ObjectId, seekerId: Types.ObjectId, connectionRequest: any) {
    try {
      // Validate seeker profile and get user details
      const seekerProfile = await getValidatedSeeker(seekerId);
      const [guide, seeker] = await Promise.all([
        User.findById(guideId),
        User.findById(seekerId)
      ]);

      if (!guide || !seeker || !seekerProfile) {
        console.error('Failed to load user data for notification');
        return;
      }

      const notificationData = {
        type: 'connection_request' as const,
        fromUserId: seekerId,
        toUserId: guideId,
        data: {
          requestId: connectionRequest._id,
          message: connectionRequest.message,
          matchScore: connectionRequest.matchScore,
          sharedSymptoms: connectionRequest.sharedSymptoms,
          seekerName: seeker.alias,
          conditionName: seekerProfile.conditionName
        }
      };

      // Send email notification
      await this.sendEmailNotification(guide.email, {
        subject: 'New Connection Request - PeerAid',
        type: 'connection_request',
        data: notificationData.data
      });

      // Log notification for now (can be extended to in-app notifications)
      console.log(`Guide notification sent: ${guide.email} - New connection request from ${seeker.alias}`);

    } catch (error) {
      console.error('Error sending guide notification:', error);
    }
  }

  /**
   * Send notification when a seeker's request is accepted
   */
  async notifySeekerOfAcceptedRequest(
    seekerId: Types.ObjectId,
    guideId: Types.ObjectId
  ) {
    try {
      // Validate both seeker and guide profiles
      const [seekerProfile, guideProfile] = await Promise.all([
        getValidatedSeeker(seekerId),
        getValidatedGuide(guideId)
      ]);
      
      const [seeker, guide] = await Promise.all([
        User.findById(seekerId),
        User.findById(guideId)
      ]);

      if (!seeker || !guide || !seekerProfile || !guideProfile) {
        console.error('Failed to load user data for notification');
        return;
      }

      const notificationData = {
        type: 'connection_accepted' as const,
        fromUserId: guideId,
        toUserId: seekerId,
        data: {
          guideName: guide.alias,
          conditionName: guideProfile.conditionName,
          guideLocation: (guideProfile as any).location
        }
      };

      // Send email notification
      await this.sendEmailNotification(seeker.email, {
        subject: 'Connection Request Accepted! - PeerAid',
        type: 'connection_accepted',
        data: notificationData.data
      });

      // Log notification for now (can be extended to in-app notifications)
      console.log(`Seeker notification sent: ${seeker.email} - Connection accepted by ${guide.alias}`);

    } catch (error) {
      console.error('Error sending seeker notification:', error);
    }
  }

  /**
   * Send notification when a connection request is rejected
   */
  async notifySeekerOfRejectedRequest(
    seekerId: Types.ObjectId,
    guideId: Types.ObjectId
  ) {
    try {
      // Validate both seeker and guide profiles
      const [seekerProfile, guideProfile] = await Promise.all([
        getValidatedSeeker(seekerId),
        getValidatedGuide(guideId)
      ]);
      
      const [seeker, guide] = await Promise.all([
        User.findById(seekerId),
        User.findById(guideId)
      ]);

      if (!seeker || !guide || !seekerProfile || !guideProfile) {
        console.error('Failed to load user data for notification');
        return;
      }

      const notificationData = {
        type: 'connection_rejected' as const,
        fromUserId: guideId,
        toUserId: seekerId,
        data: {
          guideName: guide.alias
        }
      };

      // Send email notification
      await this.sendEmailNotification(seeker.email, {
        subject: 'Connection Request Update - PeerAid',
        type: 'connection_rejected',
        data: notificationData.data
      });

      console.log(`Seeker notification sent: ${seeker.email} - Connection declined by ${guide.alias}`);

    } catch (error) {
      console.error('Error sending rejection notification:', error);
    }
  }

  /**
   * Send email notification (placeholder implementation)
   * TODO: Integrate with actual email service like SendGrid, Resend, or Nodemailer
   */
  private async sendEmailNotification(
    email: string, 
    notification: {
      subject: string;
      type: 'connection_request' | 'connection_accepted' | 'connection_rejected';
      data: any;
    }
  ) {
    try {
      // This is a placeholder implementation
      // In production, you would integrate with an email service
      
      const emailContent = this.generateEmailContent(notification);
      
      console.log('=== EMAIL NOTIFICATION ===');
      console.log(`To: ${email}`);
      console.log(`Subject: ${notification.subject}`);
      console.log(`Content: ${emailContent}`);
      console.log('========================');

      // TODO: Replace with actual email service
      // Example with different services:
      
      // With SendGrid:
      // await sgMail.send({
      //   to: email,
      //   from: process.env.FROM_EMAIL,
      //   subject: notification.subject,
      //   html: emailContent
      // });

      // With Resend:
      // await resend.emails.send({
      //   from: process.env.FROM_EMAIL,
      //   to: email,
      //   subject: notification.subject,
      //   html: emailContent
      // });

      // With Nodemailer:
      // await transporter.sendMail({
      //   from: process.env.FROM_EMAIL,
      //   to: email,
      //   subject: notification.subject,
      //   html: emailContent
      // });

    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  /**
   * Generate email content based on notification type
   */
  private generateEmailContent(notification: {
    type: 'connection_request' | 'connection_accepted' | 'connection_rejected';
    data: any;
  }): string {
    switch (notification.type) {
      case 'connection_request':
        return `
          <h2>New Connection Request</h2>
          <p>You have received a new connection request from <strong>${notification.data.seekerName}</strong>.</p>
          <p><strong>Condition:</strong> ${notification.data.conditionName}</p>
          <p><strong>Match Score:</strong> ${Math.round(notification.data.matchScore * 100)}%</p>
          ${notification.data.message ? `<p><strong>Message:</strong> "${notification.data.message}"</p>` : ''}
          ${notification.data.sharedSymptoms?.length ? `<p><strong>Shared Symptoms:</strong> ${notification.data.sharedSymptoms.join(', ')}</p>` : ''}
          <p>Please log in to your PeerAid dashboard to respond to this request.</p>
        `;

      case 'connection_accepted':
        return `
          <h2>Connection Request Accepted!</h2>
          <p>Great news! <strong>${notification.data.guideName}</strong> has accepted your connection request.</p>
          <p>You can now start connecting and learning from their experience with ${notification.data.conditionName}.</p>
          ${notification.data.guideLocation ? `<p><strong>Location:</strong> ${notification.data.guideLocation}</p>` : ''}
          <p>Please log in to your PeerAid dashboard to start your conversation.</p>
        `;

      case 'connection_rejected':
        return `
          <h2>Connection Request Update</h2>
          <p>Unfortunately, <strong>${notification.data.guideName}</strong> was unable to accept your connection request at this time.</p>
          <p>Don't worry! There are many other guides available who may be a great match for you.</p>
          <p>Please continue exploring matches in your PeerAid dashboard.</p>
        `;

      default:
        return '<p>You have a new notification from PeerAid.</p>';
    }
  }

  /**
   * Future method for push notifications
   */
  async sendPushNotification(userId: Types.ObjectId, notification: NotificationData) {
    // TODO: Implement push notifications
    // This could integrate with Firebase, OneSignal, or similar services
    console.log(`Push notification placeholder for user ${userId}`);
  }
}