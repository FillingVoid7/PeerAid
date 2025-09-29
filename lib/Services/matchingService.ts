import { Types } from 'mongoose';
import HealthProfile from '@/models/healthProfile';
import { ISymptom } from '../../models/types/symptom';

export interface MatchResult {
  guideProfile: any;
  matchScore: number;
  sharedSymptoms: string[];
  effectiveTreatments: string[];
}

export interface ScoreBreakdown {
  condition: number;
  symptoms: number;
  demographics: number;
  treatments: number;
  verification: number;
}

const MATCH_WEIGHTS = {
  condition: 0.35,
  symptoms: 0.25,
  demographics: 0.15,
  treatments: 0.15,
  verification: 0.10
};

export class MatchingService {
  
  //Find matching guides for a seeker

  async findMatches(seekerId: Types.ObjectId, limit: number = 20): Promise<MatchResult[]> {
    // Validate seeker exists and has correct role
    const seeker = await this.getValidatedSeeker(seekerId);
    
    // Find potential guides
    const guides = await this.findPotentialGuides(seeker);
    
    // Calculate matches and sort by score
    const matches = await Promise.all(
      guides.map(guide => this.calculateMatch(seeker, guide))
    );
    
    return matches
      .filter(match => match.matchScore > 0.3) // Minimum threshold
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

   // Validate seeker exists and has correct role
    
  private async getValidatedSeeker(seekerId: Types.ObjectId) {
    const seeker = await HealthProfile.findOne({ 
      userId: seekerId, 
      role: 'seeker' 
    }).populate('userId');
    
    if (!seeker) {
      throw new Error(`No seeker profile found for user: ${seekerId}`);
    }
    
    return seeker;
  }

  // Find potential guides based on seeker's condition

  private async findPotentialGuides(seeker: any) {
    return await HealthProfile.find({
      role: 'guide',
      conditionCategory: seeker.conditionCategory,
      isVerified: true
    }).populate('userId');
  }

  // Calculate match between seeker and guide

  private async calculateMatch(seeker: any, guide: any): Promise<MatchResult> {
    const scores = await this.calculateAllScores(seeker, guide);
    const matchScore = this.combineScores(scores);
    
    return {
      guideProfile: guide,
      matchScore: this.roundScore(matchScore),
      sharedSymptoms: this.findSharedSymptoms(seeker.symptoms, guide.symptoms),
      effectiveTreatments: this.findEffectiveTreatments(guide.treatments)
    };
  }

  // Calculate all individual scores

  private async calculateAllScores(seeker: any, guide: any): Promise<ScoreBreakdown> {
    return {
      condition: this.calculateConditionScore(seeker.conditionName, guide.conditionName),
      symptoms: this.calculateSymptomScore(seeker.symptoms, guide.symptoms),
      demographics: this.calculateDemographicScore(seeker, guide),
      treatments: this.calculateTreatmentScore(guide.treatments),
      verification: this.calculateVerificationScore(guide)
    };
  }

  // Combine scores using weights

  private combineScores(scores: ScoreBreakdown): number {
    return (
      scores.condition * MATCH_WEIGHTS.condition +
      scores.symptoms * MATCH_WEIGHTS.symptoms +
      scores.demographics * MATCH_WEIGHTS.demographics +
      scores.treatments * MATCH_WEIGHTS.treatments +
      scores.verification * MATCH_WEIGHTS.verification
    );
  }

  // Calculate condition similarity score

  private calculateConditionScore(seekerCondition: string, guideCondition: string): number {
    // Exact match
    if (seekerCondition.toLowerCase() === guideCondition.toLowerCase()) {
      return 1.0;
    }

    // Partial match using word overlap
    const seekerWords = new Set(seekerCondition.toLowerCase().split(/\s+/));
    const guideWords = new Set(guideCondition.toLowerCase().split(/\s+/));
    
    const commonWords = [...seekerWords].filter(word => guideWords.has(word));
    const allWords = new Set([...seekerWords, ...guideWords]);
    
    return commonWords.length / allWords.size;
  }

  // Calculate symptom similarity score

  private calculateSymptomScore(seekerSymptoms: ISymptom[], guideSymptoms: ISymptom[]): number {
    if (!seekerSymptoms.length || !guideSymptoms.length) return 0;

    const nameScore = this.calculateSymptomNameScore(seekerSymptoms, guideSymptoms);
    const severityScore = this.calculateSymptomSeverityScore(seekerSymptoms, guideSymptoms);
    
    return (nameScore * 0.7) + (severityScore * 0.3);
  }

  // Calculate symptom name similarity

  private calculateSymptomNameScore(seekerSymptoms: ISymptom[], guideSymptoms: ISymptom[]): number {
    const seekerNames = new Set(seekerSymptoms.map(s => s.name_of_symptoms.toLowerCase()));
    const guideNames = new Set(guideSymptoms.map(s => s.name_of_symptoms.toLowerCase()));
    
    const commonSymptoms = [...seekerNames].filter(name => guideNames.has(name));
    const allSymptoms = new Set([...seekerNames, ...guideNames]);
    
    return commonSymptoms.length / allSymptoms.size;
  }

  // Calculate symptom severity similarity

  private calculateSymptomSeverityScore(seekerSymptoms: ISymptom[], guideSymptoms: ISymptom[]): number {
    const severityValues = { mild: 1, moderate: 2, severe: 3 };
    
    let totalScore = 0;
    let matchedSymptoms = 0;

    seekerSymptoms.forEach(seekerSymptom => {
      const guideSymptom = guideSymptoms.find(g => 
        g.name_of_symptoms.toLowerCase() === seekerSymptom.name_of_symptoms.toLowerCase()
      );
      
      if (guideSymptom) {
        const seekerSeverity = severityValues[seekerSymptom.severity as keyof typeof severityValues] || 1;
        const guideSeverity = severityValues[guideSymptom.severity as keyof typeof severityValues] || 1;
        
        // Score based on how close the severities are
        const severityMatch = 1 - Math.abs(seekerSeverity - guideSeverity) / 3;
        totalScore += severityMatch;
        matchedSymptoms++;
      }
    });

    return matchedSymptoms > 0 ? totalScore / matchedSymptoms : 0;
  }

  // Calculate demographic similarity score  

  private calculateDemographicScore(seeker: any, guide: any): number {
    const scores: number[] = [];

    // Age similarity
    if (seeker.age && guide.age) {
      const ageDiff = Math.abs(seeker.age - guide.age);
      const ageScore = Math.max(0, 1 - ageDiff / 20);
      scores.push(ageScore);
    }

    // Gender similarity (more important for reproductive conditions)
    if (seeker.gender && guide.gender) {
      const genderScore = seeker.gender === guide.gender ? 
        (seeker.conditionCategory === 'reproductive' ? 0.8 : 0.3) : 0;
      scores.push(genderScore);
    }

    // Location similarity
    if (seeker.location && guide.location) {
      const locationScore = seeker.location.toLowerCase() === guide.location.toLowerCase() ? 0.8 : 0.2;
      scores.push(locationScore);
    }

    return scores.length > 0 ? scores.reduce((a, b) => a + b) / scores.length : 0.5;
  }

  
   // Calculate treatment effectiveness score
   
  private calculateTreatmentScore(treatments: any[]): number {
    if (!treatments || treatments.length === 0) return 0.2;

    const effectiveCount = treatments.filter(t => 
      t.effectiveness === 'effective' || t.effectiveness === 'very effective'
    ).length;

    return Math.min(1.0, (effectiveCount / treatments.length) * 1.2);
  }

  // Calculate verification score

  private calculateVerificationScore(guide: any): number {
    if (!guide.isVerified) return 0;

    const verificationScores = {
      'medical_document': 1.0,
      'community-validated': 0.7,
      'self-declared': 0.3
    };

    return verificationScores[guide.verificationMethod as keyof typeof verificationScores] || 0.5;
  }

  // Find symptoms shared between seeker and guide

  private findSharedSymptoms(seekerSymptoms: ISymptom[], guideSymptoms: ISymptom[]): string[] {
    const seekerNames = seekerSymptoms.map(s => s.name_of_symptoms.toLowerCase());
    const guideNames = guideSymptoms.map(s => s.name_of_symptoms.toLowerCase());
    
    return [...new Set(seekerNames.filter(name => guideNames.includes(name)))];
  }

  // Find effective treatments from guide

  private findEffectiveTreatments(treatments: any[]): string[] {
    return treatments
      .filter(t => t.effectiveness === 'effective' || t.effectiveness === 'very effective')
      .map(t => t.name);
  }
  
  // Helper to round scores to 2 decimal places

  private roundScore(score: number): number {
    return Math.round(score * 100) / 100;
  }

   // Calculate match score between two profiles (public method for SearchService)

  async calculateMatchScore(profile1: any, profile2: any): Promise<MatchResult> {
    return await this.calculateMatch(profile1, profile2);
  }
}

  


