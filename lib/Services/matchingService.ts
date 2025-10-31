import { Types } from 'mongoose';
import { getValidatedGuide, getValidatedSeeker } from '../utilities/profileValidationService';

export interface MatchResult {
  guideProfile?: any;
  seekerProfile?: any;
  matchScore: number; // 0-100 scale
  breakdown: {
    conditionMatch: number;
    symptomMatch: number;
    demographicMatch: number;
    treatmentMatch: number;
    verificationBonus: number;
  };
  sharedSymptoms: string[];
  effectiveTreatments: string[];
  connectionStrength: 'high' | 'medium' | 'low';
  explanation?: string; 
}

export class MatchingService {
  private readonly MATCHING_WEIGHTS = {
    condition: 0.40,    
    symptoms: 0.30,     
    demographics: 0.15,  
    treatments: 0.10,    
    verification: 0.05   
  };

  // Find ALL guides ranked by match score 
  
  async findMatches(seekerId: Types.ObjectId, guideId: Types.ObjectId, limit: number = 50 ): Promise<MatchResult[]> {
    const seekerProfile = await getValidatedSeeker(seekerId);
    const allGuides = await getValidatedGuide(guideId);
    
    // Calculate match scores for EVERY guide
    const allMatches: MatchResult[] = await Promise.all(
      allGuides.map(guide => this.calculateMatchScore(seekerProfile, guide))
    );

    return allMatches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

     
  private async calculateMatchScore(seeker: any, guide: any): Promise<MatchResult> {
    const conditionMatch = this.calculateConditionMatch(seeker, guide);
    const symptomMatch = this.calculateSymptomMatch(seeker.symptoms, guide.symptoms);
    const demographicMatch = this.calculateDemographicMatch(seeker, guide);
    const treatmentMatch = this.calculateTreatmentMatch(guide.treatments);
    const verificationBonus = this.calculateVerificationBonus(guide);

    const sharedSymptoms = this.findSharedSymptoms(seeker.symptoms, guide.symptoms);
    const effectiveTreatments = this.findEffectiveTreatments(guide.treatments);

    // Calculate weighted total score (0-100)
    const weightedScore = 
      conditionMatch * this.MATCHING_WEIGHTS.condition * 100 +
      symptomMatch * this.MATCHING_WEIGHTS.symptoms * 100 +
      demographicMatch * this.MATCHING_WEIGHTS.demographics * 100 +
      treatmentMatch * this.MATCHING_WEIGHTS.treatments * 100 +
      verificationBonus * this.MATCHING_WEIGHTS.verification * 100;

    const matchScore = Math.min(100, Math.round(weightedScore));

    // Extract alias from populated userId and include it in guideProfile
    const guideProfileWithAlias = {
      ...guide.toObject(),
      alias: guide.userId?.alias || null
    };

    return {
      guideProfile: guideProfileWithAlias,
      matchScore,
      breakdown: {
        conditionMatch: Math.round(conditionMatch * 100),
        symptomMatch: Math.round(symptomMatch * 100),
        demographicMatch: Math.round(demographicMatch * 100),
        treatmentMatch: Math.round(treatmentMatch * 100),
        verificationBonus: Math.round(verificationBonus * 100),
      },
      sharedSymptoms,
      effectiveTreatments,
      connectionStrength: this.getConnectionStrength(matchScore)
    };
  }

 
  private calculateConditionMatch(seeker: any, guide: any): number {
    if (seeker.conditionName?.toLowerCase() === guide.conditionName?.toLowerCase()) {
      return 1.0;
    }

    if (seeker.conditionCategory === guide.conditionCategory) {
      return 0.8;
    }

    const seekerWords = new Set<String>(seeker.conditionName?.toLowerCase().split(/\W+/) || []);
    const guideWords = new Set<String>(guide.conditionName?.toLowerCase().split(/\W+/) || []);
    
    const intersection = [...seekerWords].filter(word => 
      word.length > 3 && guideWords.has(word)
    ).length;
    
    const union = new Set([...seekerWords, ...guideWords]).size;
    if (union === 0) return 0.1; 
    const jaccardSimilarity = intersection / union;
    return Math.min(0.7, jaccardSimilarity * 2); 
  }

  private calculateSymptomMatch(seekerSymptoms: any[], guideSymptoms: any[]): number {
    if (!seekerSymptoms?.length || !guideSymptoms?.length) {
      return 0.1;
    }

    const seekerSymptomNames = seekerSymptoms.map(s => s.name_of_symptoms?.toLowerCase() || s.name?.toLowerCase() || '');
    const guideSymptomNames = guideSymptoms.map(s => s.name_of_symptoms?.toLowerCase() || s.name?.toLowerCase() || '');

    const intersection = seekerSymptomNames.filter(name => 
      guideSymptomNames.includes(name)
    ).length;
    
    const union = new Set([...seekerSymptomNames, ...guideSymptomNames]).size;
    
    const baseSimilarity = union > 0 ? intersection / union : 0;

    let severityBonus = 0;
    const sharedSymptoms = seekerSymptoms.filter(seekerSymptom =>
      guideSymptoms.some(guideSymptom => 
        (guideSymptom.name_of_symptoms?.toLowerCase() || guideSymptom.name?.toLowerCase()) === 
        (seekerSymptom.name_of_symptoms?.toLowerCase() || seekerSymptom.name?.toLowerCase())
      )
    );

    if (sharedSymptoms.length > 0) {
      severityBonus = sharedSymptoms.reduce((acc, seekerSymptom) => {
        const guideSymptom = guideSymptoms.find(g => 
          (g.name_of_symptoms?.toLowerCase() || g.name?.toLowerCase()) === 
          (seekerSymptom.name_of_symptoms?.toLowerCase() || seekerSymptom.name?.toLowerCase())
        )!;
        
        if (seekerSymptom.severity === guideSymptom.severity) {
          return acc + 0.3;
        }
        return acc + 0.1; 
      }, 0) / sharedSymptoms.length;
    }

    return Math.min(1, baseSimilarity + severityBonus * 0.5);
  }

  
  private calculateDemographicMatch(seeker: any, guide: any): number {
    let score = 0;
    let factors = 0;

    if (seeker.age && guide.age) {
      const ageDiff = Math.abs(seeker.age - guide.age);
      const ageScore = Math.max(0, 1 - ageDiff / 30); 
      score += ageScore;
      factors++;
    }

    if (seeker.gender && guide.gender) {
      const isGenderRelevant = this.isGenderRelevantCondition(seeker.conditionCategory);
      if (isGenderRelevant && seeker.gender === guide.gender) {
        score += 0.8;
        factors += 1;
      } else if (seeker.gender === guide.gender) {
        score += 0.3;
        factors += 0.5;
      }
    }

    if (seeker.location && guide.location && 
        seeker.location.toLowerCase() === guide.location.toLowerCase()) {
      score += 0.4;
      factors++;
    }

    return factors > 0 ? score / factors : 0.5; 
  }


  private calculateTreatmentMatch(treatments: any[]): number {
    if (!treatments?.length) return 0.2; 

    const effectiveTreatments = treatments.filter(treatment => 
      treatment.effectiveness === 'effective' || 
      treatment.effectiveness === 'very effective'
    );

    const effectivenessRatio = effectiveTreatments.length / treatments.length;
    
    const volumeBonus = Math.min(0.3, treatments.length * 0.05);
    
    return Math.min(1, effectivenessRatio + volumeBonus);
  }

  private calculateVerificationBonus(guide: any): number {
    if (!guide.isVerified) return 0;
    
    const verificationScores = {
      'medical_document': 1.0,
      'community-validated': 0.7,
      'self-declared': 0.3
    };
    
    return verificationScores[guide.verificationMethod as keyof typeof verificationScores] || 0.5;
  }

 
  private getConnectionStrength(score: number): 'high' | 'medium' | 'low' {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  private isGenderRelevantCondition(conditionCategory: string): boolean {
    const genderSpecificConditions = ['reproductive', 'internal'];
    return genderSpecificConditions.includes(conditionCategory);
  }

  private findSharedSymptoms(seekerSymptoms: any[], guideSymptoms: any[]): string[] {
    if (!seekerSymptoms?.length || !guideSymptoms?.length) return [];
    
    const seekerNames = seekerSymptoms.map(s => s.name_of_symptoms?.toLowerCase() || s.name?.toLowerCase() || '');
    const guideNames = guideSymptoms.map(s => s.name_of_symptoms?.toLowerCase() || s.name?.toLowerCase() || '');
    
    return [...new Set(seekerNames.filter(name => guideNames.includes(name)))];
  }

  private findEffectiveTreatments(treatments: any[]): string[] {
    if (!treatments?.length) return [];
    
    return treatments
      .filter(treatment => 
        treatment.effectiveness === 'effective' || 
        treatment.effectiveness === 'very effective'
      )
      .map(treatment => treatment.name)
      .slice(0, 5); // Limit to top 5
  }

  getMatchExplanation(match: MatchResult): string {
    const { breakdown, sharedSymptoms } = match;
    
    const explanations: string[] = [];
    
    if (breakdown.conditionMatch > 80) {
      explanations.push("Same health condition");
    } else if (breakdown.conditionMatch > 50) {
      explanations.push("Similar health condition");
    }
    
    if (breakdown.symptomMatch > 70) {
      explanations.push(`Shares ${sharedSymptoms.length} symptoms`);
    }
    
    if (breakdown.demographicMatch > 60) {
      explanations.push("Similar demographic background background");
    }
    
    if (breakdown.treatmentMatch > 50) {
      explanations.push("Effective treatments documented");
    }
    
    if (breakdown.verificationBonus > 50) {
      explanations.push("Verified experience");
    }
    
    return explanations.length > 0 
      ? explanations.join(" • ")
      : "Potential match based on health experience";
  }

  async calculateMatchScorePublic(profile1: any, profile2: any): Promise<MatchResult> {
    return await this.calculateMatchScore(profile1, profile2);
  }
}