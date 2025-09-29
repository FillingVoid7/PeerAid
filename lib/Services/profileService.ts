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

export interface ProfileCheckResponse {
  success: boolean;
  hasProfile: boolean;
  profile?: any;
  message?: string;
}

class ProfileService {
  private baseURL = '/api';
  async getProfile(userId: string): Promise<ProfileCheckResponse> {
    try {
      const response = await axios.get(
        `${this.baseURL}/get-profile/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const profile = response.data.profile ?? null;
      return {
        success: true,
        hasProfile: Boolean(profile),
        profile,
      };
    } catch (error) {
      console.error('Get profile error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return { success: true, hasProfile: false, profile: null };
        }
        return {
          success: false,
          hasProfile: false,
          message: error.response?.data?.message || 'Server error occurred',
        };
      }
      return { success: false, hasProfile: false, message: 'An unexpected error occurred' };
    }
  }
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

  async checkProfileExists(userId: string): Promise<ProfileCheckResponse> {
    try {
      const response = await axios.get(
        `${this.baseURL}/get-profile/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const hasProfile = response.data.profile !== null && response.data.profile !== undefined;
      
      return {
        success: true,
        hasProfile,
        profile: response.data.profile || null,
      };
    } catch (error) {
      console.error('Profile check error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 404) {
            return {
              success: true,
              hasProfile: false,
              profile: null,
            };
          }
          return {
            success: false,
            hasProfile: false,
            message: error.response.data?.message || 'Server error occurred',
          };
        } else if (error.request) {
          return {
            success: false,
            hasProfile: false,
            message: 'Network error - please check your connection',
          };
        }
      }
      
      return {
        success: false,
        hasProfile: false,
        message: 'An unexpected error occurred',
      };
    }
  }

  async updateProfile(userId: string, updates: Record<string, unknown>): Promise<ProfileSetupResponse> {
    try {
      const response = await axios.patch<ProfileSetupResponse>(
        `${this.baseURL}/get-profile/${userId}`,
        updates,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return {
        success: true,
        message: 'Profile updated successfully',
        profile: (response.data as any).profile ?? null,
      };
    } catch (error) {
      console.error('Profile update error:', error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || 'Server error occurred',
        };
      }
      return { success: false, message: 'An unexpected error occurred' };
    }
  }

  async updateField(userId: string, fieldName: string, fieldValue: any): Promise<ProfileSetupResponse> {
    try {
      const updates = { [fieldName]: fieldValue };
      const response = await axios.patch<ProfileSetupResponse>(
        `${this.baseURL}/get-profile/${userId}`,
        updates,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return {
        success: true,
        message: `${fieldName} updated successfully`,
        profile: (response.data as any).profile ?? null,
      };
    } catch (error) {
      console.error('Field update error:', error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || 'Server error occurred',
        };
      }
      return { success: false, message: 'An unexpected error occurred' };
    }
  }

  async deleteProfile(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(
        `${this.baseURL}/get-profile/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      return { success: true, message: response.data?.message || 'Profile deleted successfully' };
    } catch (error) {
      console.error('Profile delete error:', error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || 'Server error occurred',
        };
      }
      return { success: false, message: 'An unexpected error occurred' };
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
