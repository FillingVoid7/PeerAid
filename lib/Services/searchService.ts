import { Types } from 'mongoose';
import HealthProfile from '@/models/healthProfile';
import { MatchingService, MatchResult } from './matchingService';

export interface SearchFilters {
  // Basic filters
  conditionCategory?: string;
  conditionName?: string;
  symptoms?: string[];
  
  // Medical filters
  symptomSeverity?: 'mild' | 'moderate' | 'severe';
  treatmentTypes?: string[];
  diagnosedOnly?: boolean;
  conditionDuration?: 'recent' | 'chronic' | 'resolved';
  
  // Demographic filters
  ageRange?: { min: number; max: number };
  gender?: string;
  location?: string;
  
  // Quality filters
  verificationStatus?: 'any' | 'verified' | 'not-verified';
  verificationMethod?: 'medical_document' | 'community-validated' | 'self-declared';
  minHelpfulCount?: number;
  minMatchScore?: number;
  
  // Pagination & sorting
  sortBy?: 'relevance' | 'helpfulCount' | 'matchCount' | 'verification' | 'recent';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

export interface SearchResult {
  profiles: any[];
  totalCount: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
  filtersUsed: Partial<SearchFilters>;
  searchSummary: {
    conditionMatches: number;
    symptomMatches: number;
    verifiedProfiles: number;
  };
}

interface MongoQuery {
  [key: string]: any;
}

export class SearchService {
  private matchingService: MatchingService;

  constructor() {
    this.matchingService = new MatchingService();
  }

  async searchProfiles(
    filters: SearchFilters, 
    userRole: 'seeker' | 'guide' = 'seeker',
    currentUserId?: Types.ObjectId
  ): Promise<SearchResult> {
    // Build query step by step
    const query = this.buildBaseQuery(filters, userRole);
    
    // Get pagination settings
    const { limit = 20, page = 1 } = filters;
    const skip = (page - 1) * limit;

    // Execute search
    const [profiles, totalCount] = await Promise.all([
      this.executeSearchQuery(query, filters, skip, limit),
      HealthProfile.countDocuments(query)
    ]);

    // Enhance with match scores if user provided
    const enhancedProfiles = await this.enhanceProfilesWithMatchScores(
      profiles,
      filters,
      userRole,
      currentUserId
    );

    // Calculate search summary
    const searchSummary = await this.calculateSearchSummary(query, filters);

    return {
      profiles: enhancedProfiles,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: page < Math.ceil(totalCount / limit),
      filtersUsed: filters,
      searchSummary
    };
  }

  private buildBaseQuery(filters: SearchFilters, userRole: 'seeker' | 'guide'): MongoQuery {
    const query: MongoQuery = {
      role: userRole === 'seeker' ? 'guide' : 'seeker'
    };

    // Apply all filters
    this.applyConditionFilters(query, filters);
    this.applySymptomFilters(query, filters);
    this.applyTreatmentFilters(query, filters);
    this.applyDurationFilters(query, filters);
    this.applyDemographicFilters(query, filters);
    this.applyQualityFilters(query, filters);

    return query;
  }

  private applyConditionFilters(query: MongoQuery, filters: SearchFilters): void {
    if (filters.conditionCategory) {
      query.conditionCategory = filters.conditionCategory;
    }
    
    if (filters.conditionName) {
      query.$or = [
        { conditionName: { $regex: filters.conditionName, $options: 'i' } },
        { conditionDescription: { $regex: filters.conditionName, $options: 'i' } }
      ];
    }
  }

  private applySymptomFilters(query: MongoQuery, filters: SearchFilters): void {
    if (filters.symptoms?.length) {
      query['symptoms.name'] = { 
        $in: filters.symptoms.map(s => new RegExp(s, 'i')) 
      };
    }

    if (filters.symptomSeverity) {
      query['symptoms.severity'] = filters.symptomSeverity;
    }
  }

  private applyTreatmentFilters(query: MongoQuery, filters: SearchFilters): void {
    if (filters.treatmentTypes?.length) {
      query['treatments.type'] = { $in: filters.treatmentTypes };
    }

    if (filters.diagnosedOnly) {
      query['diagnosis.diagnosed'] = true;
      query['diagnosis.certainty'] = { $in: ['probable', 'confirmed'] };
    }
  }

  private applyDurationFilters(query: MongoQuery, filters: SearchFilters): void {
    if (!filters.conditionDuration) return;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const sixMonthsAgo = currentMonth - 6;

    switch (filters.conditionDuration) {
      case 'recent':
        query.$or = [
          { onsetYear: currentYear, onsetMonth: { $gte: sixMonthsAgo } },
          { onsetYear: currentYear - 1, onsetMonth: { $gte: sixMonthsAgo + 12 } }
        ];
        break;

      case 'chronic':
        query.$and = [
          { onsetYear: { $lt: currentYear - 1 } },
          { $or: [
            { resolvedYear: { $exists: false } },
            { resolvedYear: { $gte: currentYear } }
          ]}
        ];
        break;

      case 'resolved':
        query.resolvedYear = { $exists: true };
        query.resolvedMonth = { $exists: true };
        break;
    }
  }

  private applyDemographicFilters(query: MongoQuery, filters: SearchFilters): void {
    if (filters.ageRange) {
      query.age = { $gte: filters.ageRange.min, $lte: filters.ageRange.max };
    }
    
    if (filters.gender) {
      query.gender = filters.gender;
    }
    
    if (filters.location) {
      query.$or = [
        { location: { $regex: filters.location, $options: 'i' } },
        { nationality: { $regex: filters.location, $options: 'i' } }
      ];
    }
  }

  private applyQualityFilters(query: MongoQuery, filters: SearchFilters): void {
    if (filters.verificationStatus === 'verified') {
      query.isVerified = true;
    } else if (filters.verificationStatus === 'not-verified') {
      query.isVerified = false;
    }

    if (filters.verificationMethod) {
      query.verificationMethod = filters.verificationMethod;
    }
    
    if (filters.minHelpfulCount) {
      query.helpfulCount = { $gte: filters.minHelpfulCount };
    }
  }

  private getSortOptions(sortBy?: string, sortOrder?: string): Record<string, 1 | -1> {
    const order = sortOrder === 'asc' ? 1 : -1;

    switch (sortBy) {
      case 'helpfulCount':
        return { helpfulCount: order };
      case 'matchCount':
        return { matchCount: order };
      case 'verification':
        return { isVerified: order, verificationMethod: order };
      case 'recent':
        return { createdAt: order };
      case 'relevance':
      default:
        return { helpfulCount: -1, isVerified: -1, matchCount: -1 };
    }
  }

  private async executeSearchQuery(
    query: MongoQuery, 
    filters: SearchFilters, 
    skip: number, 
    limit: number
  ) {
    const sortOptions = this.getSortOptions(filters.sortBy, filters.sortOrder);
    
    return HealthProfile.find(query)
      .populate('userId', 'randomUsername displayName showProfile avatar bio')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
  }

  private async enhanceProfilesWithMatchScores(
    profiles: any[],
    filters: SearchFilters,
    userRole: 'seeker' | 'guide',
    currentUserId?: Types.ObjectId
  ) {
    // Only enhance for seekers with current user ID
    if (userRole !== 'seeker' || !currentUserId) {
      return profiles;
    }

    const seekerProfile = await HealthProfile.findOne({ 
      userId: currentUserId, 
      role: 'seeker' 
    });

    if (!seekerProfile) return profiles;

    // Calculate match scores for all profiles
    const enhancedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        const matchResult = await this.matchingService.calculateMatchScorePublic(
          seekerProfile, 
          profile
        );
        
        return {
          ...profile.toObject(),
          matchScore: matchResult.matchScore,
          connectionStrength: matchResult.connectionStrength,
          sharedSymptoms: matchResult.sharedSymptoms,
          effectiveTreatments: matchResult.effectiveTreatments
        };
      })
    );

    // Filter by minimum match score if specified
    const filteredProfiles = filters.minMatchScore 
      ? enhancedProfiles.filter(profile => profile.matchScore >= filters.minMatchScore!)
      : enhancedProfiles;

    // Re-sort by match score for relevance sorting
    if (filters.sortBy === 'relevance') {
      filteredProfiles.sort((a, b) => b.matchScore - a.matchScore);
    }

    return filteredProfiles;
  }

  private async calculateSearchSummary(query: MongoQuery, filters: SearchFilters) {
    const [conditionMatches, symptomMatches, verifiedProfiles] = await Promise.all([
      HealthProfile.countDocuments({
        ...query,
        conditionCategory: filters.conditionCategory || { $exists: true }
      }),
      
      HealthProfile.countDocuments({
        ...query,
        ...(filters.symptoms?.length && { 
          'symptoms.name': { $in: filters.symptoms.map(s => new RegExp(s, 'i')) } 
        })
      }),
      
      HealthProfile.countDocuments({
        ...query,
        isVerified: true
      })
    ]);

    return {
      conditionMatches,
      symptomMatches,
      verifiedProfiles
    };
  }

  /**
   * Find similar profiles with enhanced matching
   */
  async findSimilarProfiles(
    profileId: Types.ObjectId, 
    limit: number = 10,
    includeMatchDetails: boolean = true
  ) {
    const baseProfile = await HealthProfile.findById(profileId)
      .populate('userId', 'randomUsername displayName showProfile avatar bio');
    
    if (!baseProfile) return [];

    const targetRole = baseProfile.role === 'seeker' ? 'guide' : 'seeker';
    
    // Find profiles with same condition category
    const similarProfiles = await HealthProfile.find({
      _id: { $ne: profileId },
      role: targetRole,
      conditionCategory: baseProfile.conditionCategory
    })
    .populate('userId', 'randomUsername displayName showProfile avatar bio')
    .limit(limit * 2); // Get more for better filtering

    // Calculate match scores
    const scoredProfiles = await Promise.all(
      similarProfiles.map(async (profile) => {
        const matchResult = await this.matchingService.calculateMatchScorePublic(
          baseProfile, 
          profile
        );

        const result: any = {
          profile,
          similarityScore: matchResult.matchScore,
          connectionStrength: matchResult.connectionStrength
        };

        if (includeMatchDetails) {
          result.matchDetails = {
            sharedSymptoms: matchResult.sharedSymptoms,
            effectiveTreatments: matchResult.effectiveTreatments
          };
        }

        return result;
      })
    );

    return scoredProfiles
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  }

  /**
   * Get search suggestions for autocomplete
   */
  async getSearchSuggestions(
    query: string,
    field: 'conditionName' | 'symptoms' | 'location' = 'conditionName',
    limit: number = 10
  ): Promise<string[]> {
    if (!query || query.length < 2) return [];

    try {
      let aggregationPipeline: any[];

      if (field === 'symptoms') {
        aggregationPipeline = [
          { $unwind: '$symptoms' },
          { $match: { 'symptoms.name': { $regex: query, $options: 'i' } } },
          { $group: { _id: '$symptoms.name', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: limit }
        ];
      } else {
        aggregationPipeline = [
          { $match: { [field]: { $regex: query, $options: 'i' } } },
          { $group: { _id: `$${field}`, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: limit }
        ];
      }

      const results = await HealthProfile.aggregate(aggregationPipeline);
      return results.map(item => item._id).filter(Boolean);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Get popular searches and trending conditions
   */
  async getTrendingSearches(limit: number = 8): Promise<{condition: string, count: number}[]> {
    try {
      const trendingConditions = await HealthProfile.aggregate([
        {
          $match: {
            role: 'guide',
            isVerified: true,
            helpfulCount: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: '$conditionName',
            count: { $sum: 1 },
            totalHelpful: { $sum: '$helpfulCount' }
          }
        },
        {
          $sort: { totalHelpful: -1, count: -1 }
        },
        {
          $limit: limit
        },
        {
          $project: {
            condition: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]);

      return trendingConditions;
    } catch (error) {
      console.error('Error getting trending searches:', error);
      return [];
    }
  }
}