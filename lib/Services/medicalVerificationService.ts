import axios from 'axios';
import { IMedicalValidation } from '@/models/medicalValidation';

export interface MedicalDocumentMetadata {
  DOB?: string;
  healthcareProvider?: string;
  dateOfIssue: string;
  validTill?: string;
  documentType: "prescription" | "lab_report" | "imaging_report" | "discharge_summary" | "vaccination_record" | "insurance_document" | "other";
}

export interface UploadedFile {
  publicId: string;
  url: string;
  type: "image" | "video" | "pdf";
  fileName?: string;
  fileSize?: number;
  format?: string;
}

export interface VerificationInfo {
  patientName: string;
  referenceID?: string;
}

export interface MedicalVerificationFormData {
  userId: string;
  document_metadata: MedicalDocumentMetadata;
  verificationInfo: VerificationInfo;
  isConsentChecked: boolean;
}

export interface FileUploadResponse {
  permanentUrl: string;
  mediaType: string;
  publicId: string;
  fileName: string;
  fileSize: number;
  format: string;
}

export interface MedicalVerificationResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface MedicalReportResponse {
  success: boolean;
  hasReport: boolean;
  report?: IMedicalValidation;
  message?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export interface StatusCounts {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

export interface AllMedicalReportsResponse {
  success: boolean;
  data?: {
    reportsByUserId: { [key: string]: IMedicalValidation[] };
    totalUsers: number;
    counts: StatusCounts;
  };
  message?: string;
}

class MedicalVerificationService {
  private baseURL = '/api/medical_verification';

  // Upload file to Cloudinary
  async uploadFile(file: File, mediaType: 'image' | 'pdf'): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', mediaType);

      const response = await axios.post<FileUploadResponse>(
        `${this.baseURL}/upload-files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, 
        }
      );

      return response.data;
    } catch (error) {
      console.error('File upload error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data?.error || 'File upload failed');
        } else if (error.request) {
          throw new Error('Network error - please check your connection');
        }
      }
      
      throw new Error('An unexpected error occurred during file upload');
    }
  }

  // Submit medical verification details
  async submitMedicalVerification(
    formData: MedicalVerificationFormData,
    uploadedFile: UploadedFile
  ): Promise<MedicalVerificationResponse> {
    try {
      const payload = {
        ...formData,
        uploadedFile
      };

      const response = await axios.post<MedicalVerificationResponse>(
        `${this.baseURL}/upload_details`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Medical verification submission error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          return {
            success: false,
            message: error.response.data?.error || error.response.data?.message || 'Submission failed',
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

  // Get medical report for a user
  async getMedicalReport(userId: string): Promise<MedicalReportResponse> {
    try {
      console.log('API URL:', `${this.baseURL}/view_details/${userId}`);
      
      const response = await axios.get(
        `${this.baseURL}/view_details/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      const hasExistingVerification = Boolean(response.data.report);
      return {
        success: true,
        hasReport: hasExistingVerification,
        report: response.data.report || undefined,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          success: true,
          hasReport: false,
          report: undefined,
        };
      }
      
      console.error('Get medical report error:', error);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          hasReport: false,
          message: error.response?.data?.message || 'Server error occurred',
        };
      }
      
      return {
        success: false,
        hasReport: false,
        message: 'An unexpected error occurred',
      };
    }
  }

  // Update medical report
  async updateMedicalReport(
    userId: string, 
    updates: Partial<MedicalVerificationFormData>
  ): Promise<MedicalVerificationResponse> {
    try {
      const payload = {
        userId,
        ...updates
      };

      const response = await axios.patch(
        `${this.baseURL}/view_details/${userId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return {
        success: true,
        message: 'Medical report updated successfully',
        data: response.data.report,
      };
    } catch (error) {
      console.error('Medical report update error:', error);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || 'Update failed',
        };
      }
      
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }

  // Delete medical report
  async deleteMedicalReport(userId: string): Promise<MedicalVerificationResponse> {
    try {
      const response = await axios.delete(
        `${this.baseURL}/view_details/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return {
        success: true,
        message: response.data?.message || 'Medical report deleted successfully',
      };
    } catch (error) {
      console.error('Medical report delete error:', error);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || 'Delete failed',
        };
      }
      
      return {
        success: false,
        message: 'An unexpected error occurred',
      };
    }
  }

  // Save draft to localStorage
  saveDraft(draftData: Partial<MedicalVerificationFormData>): void {
    try {
      localStorage.setItem('medical-verification-draft', JSON.stringify(draftData));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }

  // Load draft from localStorage
  loadDraft(): Partial<MedicalVerificationFormData> | null {
    try {
      const draft = localStorage.getItem('medical-verification-draft');
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  }

  // Clear draft from localStorage
  clearDraft(): void {
    try {
      localStorage.removeItem('medical-verification-draft');
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }

  // Validate file type and size
  validateFile(file: File, mediaType: 'image' | 'pdf'): { isValid: boolean; error?: string } {
    const allowedTypes = {
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      pdf: ['application/pdf']
    };

    const maxSizes = {
      image: 10 * 1024 * 1024, // 10MB
      pdf: 20 * 1024 * 1024     // 20MB
    };

    if (!allowedTypes[mediaType].includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Expected ${mediaType} file but got ${file.type}`
      };
    }

    if (file.size > maxSizes[mediaType]) {
      return {
        isValid: false,
        error: `File too large. Maximum size for ${mediaType} is ${maxSizes[mediaType] / (1024 * 1024)}MB`
      };
    }

    return { isValid: true };
  }

  // Get all medical reports for admin verification 
  async getAllMedicalReports(
    status?: 'pending' | 'verified' | 'rejected'
  ): Promise<AllMedicalReportsResponse> {
    try {
      const params = new URLSearchParams();

      if (status) {
        params.append('status', status);
      }

      const url = params.toString() 
        ? `${this.baseURL}/view_all_details?${params.toString()}`
        : `${this.baseURL}/view_all_details`;

      const response = await axios.get(
        url,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error('Get all medical reports error:', error);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.error || error.response?.data?.message || 'Failed to fetch reports',
        };
      }
      
      return {
        success: false,
        message: 'An unexpected error occurred while fetching reports',
      };
    }
  }

  // Update verification status (Admin only)
  async updateVerificationStatus(
    userId: string, 
    verificationStatus: 'pending' | 'verified' | 'rejected'
  ): Promise<MedicalVerificationResponse> {
    try {
      const response = await axios.post<MedicalVerificationResponse>(
        `${this.baseURL}/verify_details`,
        {
          userId,
          verificationStatus,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Verification status update error:', error);
      
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.error || error.response?.data?.message || 'Verification update failed',
        };
      }
      
      return {
        success: false,
        message: 'An unexpected error occurred during verification update',
      };
    }
  }
}

const medicalVerificationService = new MedicalVerificationService();
export default medicalVerificationService;
