'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import medicalVerificationService, { UploadedFile, FileUploadResponse } from '@/lib/medicalVerificationService';
import { IMedicalValidation } from '@/models/medicalValidation';

const mediaTypes = [
  { value: "image", label: "Image (JPG, PNG, WebP)", maxSize: "10MB" },
  { value: "pdf", label: "PDF Document", maxSize: "20MB" }
];

export default function UpdateMedicalProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'pdf'>('image');
  const [newUploadedFile, setNewUploadedFile] = useState<UploadedFile | null>(null);
  const [medicalReport, setMedicalReport] = useState<IMedicalValidation | null>(null);
  const [formData, setFormData] = useState({
    document_metadata: {
      DOB: '',
      healthcareProvider: '',
      dateOfIssue: '',
      validTill: '',
      documentType: 'prescription' as "prescription" | "lab_report" | "imaging_report" | "discharge_summary" | "vaccination_record" | "insurance_document" | "other"
    },
    verificationInfo: {
      patientName: '',
      referenceID: ''
    }
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
    }
  }, [session, status, router]);

  // Load medical report
  useEffect(() => {
    if (session?.user?.id) {
      loadMedicalReport();
    }
  }, [session]);

  const loadMedicalReport = async () => {
    if (!session?.user?.id) return;

    try {
      const result = await medicalVerificationService.getMedicalReport(session.user.id);
      if (result.success && result.report) {
        setMedicalReport(result.report);
        setFormData({
          document_metadata: {
            DOB: result.report.document_metadata.DOB ? new Date(result.report.document_metadata.DOB).toISOString().split('T')[0] : '',
            healthcareProvider: result.report.document_metadata.healthcareProvider || '',
            dateOfIssue: new Date(result.report.document_metadata.dateOfIssue).toISOString().split('T')[0],
            validTill: result.report.document_metadata.validTill ? new Date(result.report.document_metadata.validTill).toISOString().split('T')[0] : '',
            documentType: result.report.document_metadata.documentType
          },
          verificationInfo: {
            patientName: result.report.verificationInfo.patientName,
            referenceID: result.report.verificationInfo.referenceID || ''
          }
        });
      } else {
        toast.error('No medical report found. Please create one first.');
        router.push('/medicalProfileVerification/createMedicalProfile');
      }
    } catch (error) {
      console.error('Error loading medical report:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = field.split('.');
      
      if (keys.length === 2) {
        (newData as any)[keys[0]][keys[1]] = value;
      } else {
        (newData as any)[field] = value;
      }
      
      return newData;
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = medicalVerificationService.validateFile(file, selectedMediaType);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setSelectedFile(file);
    setNewUploadedFile(null); // Reset uploaded file when new file is selected
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const uploadResult = await medicalVerificationService.uploadFile(selectedFile, selectedMediaType);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      const uploadedFileData: UploadedFile = {
        publicId: uploadResult.publicId,
        url: uploadResult.permanentUrl,
        type: selectedMediaType,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        format: uploadResult.format
      };

      setNewUploadedFile(uploadedFileData);
      toast.success('New file uploaded successfully!');

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.id || !medicalReport) {
      toast.error('User not authenticated or no medical report found');
      return;
    }

    setIsSaving(true);

    try {
      // If a new file was uploaded, include it in the update
      const updateData = newUploadedFile 
        ? { ...formData, uploadedFile: newUploadedFile }
        : formData;

      const result = await medicalVerificationService.updateMedicalReport(
        session.user.id,
        updateData
      );

      if (result.success) {
        toast.success('Medical profile updated successfully!');
        router.push('/medicalProfileVerification/viewMedicalProfile');
      } else {
        toast.error(result.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const documentTypes = [
    { value: "prescription", label: "Prescription" },
    { value: "lab_report", label: "Lab Report" },
    { value: "imaging_report", label: "Imaging Report" },
    { value: "discharge_summary", label: "Discharge Summary" },
    { value: "vaccination_record", label: "Vaccination Record" },
    { value: "insurance_document", label: "Insurance Document" },
    { value: "other", label: "Other" }
  ];

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !medicalReport) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Update Medical Profile</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Update your medical document information and replace files as needed
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* File Upload Section */}
          <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Update Document File (Optional)</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Upload a new document file to replace the current one
                </p>
              </div>
            </div>
            
            {/* Media Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mediaTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex cursor-pointer rounded-lg p-4 border-2 transition-all duration-200 ${
                      selectedMediaType === type.value
                        ? 'border-orange-500 bg-orange-50 shadow-md scale-105'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mediaType"
                      value={type.value}
                      checked={selectedMediaType === type.value}
                      onChange={(e) => setSelectedMediaType(e.target.value as 'image' | 'pdf')}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="font-medium text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-500">Max: {type.maxSize}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* File Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept={
                  selectedMediaType === 'image' 
                    ? 'image/jpeg,image/jpg,image/png,image/webp'
                    : 'application/pdf'
                }
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Upload Button */}
            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={handleFileUpload}
                disabled={!selectedFile || isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? 'Uploading...' : 'Upload New File'}
              </Button>
              
              {isUploading && (
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* New Uploaded File Info */}
            {newUploadedFile && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      New file uploaded successfully
                    </p>
                    <p className="text-sm text-green-600">
                      {newUploadedFile.fileName} ({(newUploadedFile.fileSize! / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Document Metadata Section */}
          <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Document Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type *
                </label>
                <select
                  value={formData.document_metadata.documentType}
                  onChange={(e) => handleInputChange('document_metadata.documentType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Issue *
                </label>
                <Input
                  type="date"
                  value={formData.document_metadata.dateOfIssue}
                  onChange={(e) => handleInputChange('document_metadata.dateOfIssue', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  value={formData.document_metadata.DOB}
                  onChange={(e) => handleInputChange('document_metadata.DOB', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Till
                </label>
                <Input
                  type="date"
                  value={formData.document_metadata.validTill}
                  onChange={(e) => handleInputChange('document_metadata.validTill', e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Healthcare Provider
                </label>
                <Input
                  type="text"
                  placeholder="Enter healthcare provider name"
                  value={formData.document_metadata.healthcareProvider}
                  onChange={(e) => handleInputChange('document_metadata.healthcareProvider', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Verification Information Section */}
          <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Verification Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name *
                </label>
                <Input
                  type="text"
                  placeholder="Enter patient name"
                  value={formData.verificationInfo.patientName}
                  onChange={(e) => handleInputChange('verificationInfo.patientName', e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference ID
                </label>
                <Input
                  type="text"
                  placeholder="Enter reference ID (optional)"
                  value={formData.verificationInfo.referenceID}
                  onChange={(e) => handleInputChange('verificationInfo.referenceID', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Current Document Info */}
          <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Current Document</h2>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {medicalReport.uploadedFile.type === 'pdf' ? (
                    <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {medicalReport.uploadedFile.fileName || 'Document'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {medicalReport.uploadedFile.type.toUpperCase()}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // For PDFs, use direct URL opening with proper headers
                  if (medicalReport.uploadedFile.type === 'pdf') {
                    // Open PDF directly in new tab - browsers handle PDFs better this way
                    const pdfUrl = `${medicalReport.uploadedFile.url}#toolbar=1&navpanes=1&scrollbar=1`;
                    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
                  } else {
                    // For images, open directly
                    window.open(medicalReport.uploadedFile.url, '_blank');
                  }
                }}
              >
                View Document
              </Button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Current document file. Use the file upload section above to replace it with a new file.
            </p>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/medicalProfileVerification/viewMedicalProfile')}
              className="px-8 py-3 text-base font-medium transition-all duration-200 hover:shadow-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 text-base font-medium bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              {isSaving ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </div>
              ) : (
                'Update Profile'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
