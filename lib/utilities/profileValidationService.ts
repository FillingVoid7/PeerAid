import { Types } from 'mongoose';
import HealthProfile from '@/models/healthProfile';

export async function getValidatedSeeker(seekerId: Types.ObjectId) {
  const seeker = await HealthProfile.findOne({ 
    userId: seekerId, 
    role: 'seeker' 
  }).populate('userId');
  
  if (!seeker) {
    throw new Error(`No seeker profile found for user: ${seekerId}`);
  }
  
  return seeker;
}


export async function getValidatedGuide(guideId: Types.ObjectId) {
  const guide = await HealthProfile.find({ 
    userId: guideId, 
    role: 'guide' 
  }).populate('userId');
  
  if (!guide) {
    throw new Error(`No guide profile found for user: ${guideId}`);
  }
  
  return guide;
}

export async function returnGuideProfile(guideId: Types.ObjectId) {
  const guideProfile = await HealthProfile.findOne({
    userId: guideId,
    role: 'guide'
  }).populate('userId');

  if (!guideProfile) {
    throw new Error(`No guide profile found for user: ${guideId}`);
  }

  return guideProfile;
}