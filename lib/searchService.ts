import { Types } from 'mongoose';
import HealthProfile from '@/models/healthProfile';
import { MatchingService } from './matchingService';

export interface SearchFilters {
  conditionCategory?: string;
  conditionName?: string;
  symptoms?: string[];
  ageRange?: { min: number; max: number };
  gender?: string;
  location?: string;
  verificationStatus?: 'any' | 'verified' | 'not-verified';
  minHelpfulCount?: number;
  limit?: number;
  page?: number;
}

export class SearchService {
  async searchProfiles(filters: SearchFilters, userRole: 'seeker' | 'guide' = 'seeker') {
    const {
      conditionCategory,
      conditionName,
      symptoms,
      ageRange,
      gender,
      location,
      verificationStatus,
      minHelpfulCount,
      limit = 20,
      page = 1
    } = filters;

    const query: any = { role: userRole === 'seeker' ? 'guide' : 'seeker' };

    if (conditionCategory) {
      query.conditionCategory = conditionCategory;
    }
    
    if (conditionName) {
      query.conditionName = { $regex: conditionName, $options: 'i' };
    }

    // Symptom-based search
    if (symptoms && symptoms.length > 0) {
      query['symptoms.name_of_symptoms'] = { $in: symptoms.map(s => new RegExp(s, 'i')) };
    }

    // Demographic filters
    if (ageRange) {
      query.age = { $gte: ageRange.min, $lte: ageRange.max };
    }
    
    if (gender) {
      query.gender = gender;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Quality filters
    if (verificationStatus) {
      query.isVerified = verificationStatus === 'verified';
    }
    
    if (minHelpfulCount) {
      query.helpfulCount = { $gte: minHelpfulCount };
    }

    const skip = (page - 1) * limit;
    
    return await HealthProfile.find(query)
      .populate('userId', 'randomUsername displayName showProfile avatar')
      .sort({ helpfulCount: -1, matchCount: -1 }) // Sort by popularity
      .skip(skip)
      .limit(limit);
  }

  
  async findSimilarProfiles(profileId: Types.ObjectId, limit: number = 10) {
    const baseProfile = await HealthProfile.findById(profileId);
    if (!baseProfile) return [];

    const matchingService = new MatchingService();
    
    const targetRole = baseProfile.role === 'seeker' ? 'guide' : 'seeker';
    const similarProfiles = await HealthProfile.find({
      _id: { $ne: profileId },
      role: targetRole,
      conditionCategory: baseProfile.conditionCategory
    }).populate('userId', 'randomUsername displayName showProfile avatar');

    const scoredProfiles = await Promise.all(
      similarProfiles.map(async (profile) => {
        const matchResult = await matchingService.calculateMatchScore(baseProfile, profile);
        return {
          profile,
          similarityScore: matchResult.matchScore
        };
      })
    );

    return scoredProfiles
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  }
}

