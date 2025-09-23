import axios from 'axios';
import { IHealthProfileBase, UserRole } from '@/models/types/profile.type';
import { PersonalInfoData } from '@/components/profile/PersonalInfoStep';
import { MedicalConditionData } from '@/components/profile/MedicalConditionStep';
import { SymptomsData } from '@/components/profile/SymptomsStep';
import { DiagnosisTreatmentData } from '@/components/profile/DiagnosisTreatmentStep';

export interface ProfileFormData {
  userId: string;
  role: UserRole;
  personalInfo: PersonalInfoData;
  medicalCondition: MedicalConditionData;
  symptoms: SymptomsData;
  diagnosisTreatment: DiagnosisTreatmentData;
  isVerified: boolean;
  verificationMethod: string;
}

export interface ProfileSetupResponse {
  success: boolean;
  message: string;
  profile?: any;
}

class ProfileService {
  private baseURL = '/api';
  async profileSetup(profileData: ProfileFormData): Promise<ProfileSetupResponse> {
    try {
      const response = await axios.post<ProfileSetupResponse>(
        `${this.baseURL}/profileHandler`,
        profileData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, 
        }
      );

      return response.data;
    } catch (error) {
      console.error('Profile setup error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          return {
            success: false,
            message: error.response.data?.message || 'Server error occurred',
          };
        } else if (error.request) {
          return {
            success: false,
            message: 'Network error - please check your connection',
          };
        }
      }
      
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }



saveDraft(draftData: any): void {
    try {
      localStorage.setItem('health-profile-draft', JSON.stringify(draftData));   //saved as json string
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }


loadDraft(): any | null {
    try {
      const draft = localStorage.getItem('health-profile-draft');
      return draft ? JSON.parse(draft) : null;    //converts json string back to object
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  }


clearDraft(): void {
    try {
      localStorage.removeItem('health-profile-draft');
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }

}

const profileService = new ProfileService();
export default profileService;
