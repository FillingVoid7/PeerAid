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
  const guide = await HealthProfile.findOne({ 
    userId: guideId, 
    role: 'guide' 
  }).populate('userId');
  
  if (!guide) {
    throw new Error(`No guide profile found for user: ${guideId}`);
  }
  
  return guide;
}


export async function findPotentialGuides(seeker: any) {
  return await HealthProfile.find({
    role: 'guide',
    conditionCategory: seeker.conditionCategory
    // Removed isVerified: true to allow matching with unverified guides
    // Verification status is still considered in the scoring algorithm
  }).populate('userId');
}
