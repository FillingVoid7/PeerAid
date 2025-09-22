import axios from 'axios';
import { IHealthProfileBase } from '@/models/types/profile.type';
import { SymptomData } from '@/components/profile/SymptomsStep';
import { DiagnosisData } from '@/components/profile/DiagnosisStep';
import { TreatmentData } from '@/components/profile/TreatmentsStep';

export interface ProfileFormData extends Omit<IHealthProfileBase, '_id' | 'createdAt' | 'updatedAt'> {
  symptoms?: SymptomData[];
  diagnosis?: DiagnosisData;
  treatments?: TreatmentData[];
}

export interface ProfileSetupResponse {
  success: boolean;
  message: string;
  profile?: any;
}

class ProfileService {
  private baseURL = '/api';

  /**
   * Submit complete profile data to the backend
   */
  async profileSetup(profileData: ProfileFormData): Promise<ProfileSetupResponse> {
    try {
      const response = await axios.post<ProfileSetupResponse>(
        `${this.baseURL}/profileHandler`,
        profileData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      return response.data;
    } catch (error) {
      console.error('Profile setup error:', error);
      
      if (axios.isAxiosError(error)) {
        // Handle axios-specific errors
        if (error.response) {
          // Server responded with error status
          return {
            success: false,
            message: error.response.data?.message || 'Server error occurred',
          };
        } else if (error.request) {
          // Request was made but no response received
          return {
            success: false,
            message: 'Network error - please check your connection',
          };
        }
      }
      
      // Generic error fallback
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }

  /**
   * Save profile data as draft (for multi-step form)
   */
  async saveDraft(draftData: Partial<ProfileFormData>): Promise<void> {
    try {
      // Save to localStorage for now - could be extended to backend
      localStorage.setItem('profileDraft', JSON.stringify(draftData));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }

  /**
   * Load profile draft data
   */
  loadDraft(): Partial<ProfileFormData> | null {
    try {
      const draft = localStorage.getItem('profileDraft');
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  }

  /**
   * Clear profile draft data
   */
  clearDraft(): void {
    try {
      localStorage.removeItem('profileDraft');
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }

  /**
   * Validate profile data before submission
   */
  validateProfile(profileData: ProfileFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!profileData.userId) errors.push('User ID is required');
    if (!profileData.role) errors.push('Role is required');
    if (!profileData.age || profileData.age < 13 || profileData.age > 120) {
      errors.push('Age must be between 13 and 120');
    }
    if (!profileData.gender) errors.push('Gender is required');
    if (!profileData.conditionCategory) errors.push('Condition category is required');
    if (!profileData.conditionName) errors.push('Condition name is required');
    if (!profileData.onsetDate) errors.push('Onset date is required');

    // Role-specific validation
    if (profileData.role === 'seeker') {
      if (!profileData.diagnosis) errors.push('Diagnosis information is required for seekers');
    }

    if (profileData.role === 'guide') {
      if (!profileData.treatments || profileData.treatments.length === 0) {
        errors.push('At least one treatment is required for guides');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const profileService = new ProfileService();
export default profileService;