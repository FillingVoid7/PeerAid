'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import medicalVerificationService, { UploadedFile, FileUploadResponse } from '@/lib/Services/medicalVerificationService';
import { IMedicalValidation } from '@/models/medicalValidation';
import { DashboardBreadcrumb } from '@/components/ui/dashboard-breadcrumb';
import { ModeToggle } from '@/components/ui/ThemeToggle';

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
  const [hasDraftData, setHasDraftData] = useState(false);
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

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
    }
  }, [session, status, router]);

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
        
        const draftData = medicalVerificationService.loadDraft();
        let finalFormData;
        
        if (draftData && (draftData.document_metadata || draftData.verificationInfo)) {
          finalFormData = {
            document_metadata: {
              DOB: draftData.document_metadata?.DOB || (result.report.document_metadata.DOB ? new Date(result.report.document_metadata.DOB).toISOString().split('T')[0] : ''),
              healthcareProvider: draftData.document_metadata?.healthcareProvider || result.report.document_metadata.healthcareProvider || '',
              dateOfIssue: draftData.document_metadata?.dateOfIssue || new Date(result.report.document_metadata.dateOfIssue).toISOString().split('T')[0],
              validTill: draftData.document_metadata?.validTill || (result.report.document_metadata.validTill ? new Date(result.report.document_metadata.validTill).toISOString().split('T')[0] : ''),
              documentType: draftData.document_metadata?.documentType || result.report.document_metadata.documentType
            },
            verificationInfo: {
              patientName: draftData.verificationInfo?.patientName || result.report.verificationInfo.patientName,
              referenceID: draftData.verificationInfo?.referenceID || result.report.verificationInfo.referenceID || ''
            }
          };
          setHasDraftData(true);
          toast.success('Draft data loaded! You can continue where you left off.');
        } else {
          finalFormData = {
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
          };
        }
        
        setFormData(finalFormData);
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
      
      medicalVerificationService.saveDraft(newData);
      
      return newData;
    });
  };

  const handleSaveDraft = () => {
    medicalVerificationService.saveDraft(formData);
    toast.success('Draft saved successfully!');
  };

  const handleClearDraft = () => {
    medicalVerificationService.clearDraft();
    setHasDraftData(false);
    toast.success('Draft cleared!');
    if (medicalReport) {
      setFormData({
        document_metadata: {
          DOB: medicalReport.document_metadata.DOB ? new Date(medicalReport.document_metadata.DOB).toISOString().split('T')[0] : '',
          healthcareProvider: medicalReport.document_metadata.healthcareProvider || '',
          dateOfIssue: new Date(medicalReport.document_metadata.dateOfIssue).toISOString().split('T')[0],
          validTill: medicalReport.document_metadata.validTill ? new Date(medicalReport.document_metadata.validTill).toISOString().split('T')[0] : '',
          documentType: medicalReport.document_metadata.documentType
        },
        verificationInfo: {
          patientName: medicalReport.verificationInfo.patientName,
          referenceID: medicalReport.verificationInfo.referenceID || ''
        }
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = medicalVerificationService.validateFile(file, selectedMediaType);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setSelectedFile(file);
    setNewUploadedFile(null); 
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || !medicalReport) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Breadcrumb and Theme Toggle */}
        <div className="flex justify-between items-center">
          <DashboardBreadcrumb />
        </div>
        
        {/* Draft notification */}
        {hasDraftData && (
          <Card className="p-4 shadow-lg border-0 bg-blue-50 dark:bg-blue-950/30 backdrop-blur-sm border-l-4 border-blue-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Draft data has been loaded from your previous editing session.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearDraft}
                className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                Clear Draft
              </Button>
            </div>
          </Card>
        )}
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-950/50 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Update Medical Profile</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Update your medical document information and replace files as needed
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* File Upload Section */}
          <Card className="p-8 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-950/50 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Update Document File (Optional)</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Upload a new document file to replace the current one
                </p>
              </div>
            </div>
            
            {/* Media Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mediaTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex cursor-pointer rounded-lg p-4 border-2 transition-all duration-200 ${
                      selectedMediaType === type.value
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/50 shadow-md scale-105'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-sm bg-white dark:bg-gray-800'
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
                      <div className="font-medium text-gray-900 dark:text-gray-100">{type.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Max: {type.maxSize}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* File Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="block w-full text-sm text-gray-500 dark:text-gray-400 
                          file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
                          file:text-sm file:font-semibold 
                          file:bg-orange-50 file:text-orange-700 
                          file:hover:bg-orange-100
                          dark:file:bg-orange-950/50 dark:file:text-orange-300 
                          dark:file:hover:bg-orange-900/50
                          border border-gray-300 dark:border-gray-600 
                          rounded-md bg-white dark:bg-gray-800
                          focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                          dark:focus:ring-orange-400 dark:focus:border-orange-400"
              />
            </div>

            {/* Upload Button */}
            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={handleFileUpload}
                disabled={!selectedFile || isUploading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isUploading ? 'Uploading...' : 'Upload New File'}
              </Button>
              
              {isUploading && (
                <div className="flex-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-600 dark:bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* New Uploaded File Info */}
            {newUploadedFile && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400 dark:text-green-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      New file uploaded successfully
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      {newUploadedFile.fileName} ({(newUploadedFile.fileSize! / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Document Metadata Section */}
          <Card className="p-8 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-950/50 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Document Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Type *
                </label>
                <select
                  value={formData.document_metadata.documentType}
                  onChange={(e) => handleInputChange('document_metadata.documentType', e.target.value)}
                  className="w-full px-3 py-2 h-9 border border-gray-300 dark:border-gray-600 
                           bg-white dark:bg-gray-800 
                           text-gray-900 dark:text-gray-100
                           rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 
                           focus:border-green-500 dark:focus:border-green-400
                           transition-colors"
                  required
                >
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value} className="bg-white dark:bg-gray-800">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Issue *
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.document_metadata.dateOfIssue}
                    onChange={(e) => handleInputChange('document_metadata.dateOfIssue', e.target.value)}
                    className="pl-10 pr-4 h-10 text-sm bg-white dark:bg-gray-800 
                             border-gray-300 dark:border-gray-600
                             text-gray-900 dark:text-gray-100
                             focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400
                             focus:border-green-500 dark:focus:border-green-400
                             transition-all duration-200"
                    required
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date of Birth (Optional)
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.document_metadata.DOB}
                    onChange={(e) => handleInputChange('document_metadata.DOB', e.target.value)}
                    className="pl-10 pr-4 h-10 text-sm bg-white dark:bg-gray-800 
                             border-gray-300 dark:border-gray-600
                             text-gray-900 dark:text-gray-100
                             focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400
                             focus:border-green-500 dark:focus:border-green-400
                             transition-all duration-200"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valid Till (Optional)
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.document_metadata.validTill}
                    onChange={(e) => handleInputChange('document_metadata.validTill', e.target.value)}
                    className="pl-10 pr-4 h-10 text-sm bg-white dark:bg-gray-800 
                             border-gray-300 dark:border-gray-600
                             text-gray-900 dark:text-gray-100
                             focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400
                             focus:border-green-500 dark:focus:border-green-400
                             transition-all duration-200"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Healthcare Provider (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="Enter healthcare provider name"
                  value={formData.document_metadata.healthcareProvider}
                  onChange={(e) => handleInputChange('document_metadata.healthcareProvider', e.target.value)}
                  className="h-10 bg-white dark:bg-gray-800 
                           border-gray-300 dark:border-gray-600
                           text-gray-900 dark:text-gray-100
                           placeholder:text-gray-500 dark:placeholder:text-gray-400
                           focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400
                           focus:border-green-500 dark:focus:border-green-400"
                />
              </div>
            </div>
          </Card>

          {/* Verification Information Section */}
          <Card className="p-8 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-950/50 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Verification Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Patient Name *
                </label>
                <Input
                  type="text"
                  placeholder="Enter patient name"
                  value={formData.verificationInfo.patientName}
                  onChange={(e) => handleInputChange('verificationInfo.patientName', e.target.value)}
                  className="h-10 bg-white dark:bg-gray-800 
                           border-gray-300 dark:border-gray-600
                           text-gray-900 dark:text-gray-100
                           placeholder:text-gray-500 dark:placeholder:text-gray-400
                           focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400
                           focus:border-purple-500 dark:focus:border-purple-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reference ID (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="Enter reference ID (optional)"
                  value={formData.verificationInfo.referenceID}
                  onChange={(e) => handleInputChange('verificationInfo.referenceID', e.target.value)}
                  className="h-10 bg-white dark:bg-gray-800 
                           border-gray-300 dark:border-gray-600
                           text-gray-900 dark:text-gray-100
                           placeholder:text-gray-500 dark:placeholder:text-gray-400
                           focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400
                           focus:border-purple-500 dark:focus:border-purple-400"
                />
              </div>
            </div>
          </Card>

          {/* Current Document Info */}
          <Card className="p-8 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Current Document</h2>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {medicalReport.uploadedFile.type === 'pdf' ? (
                    <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {medicalReport.uploadedFile.fileName || 'Document'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {medicalReport.uploadedFile.type.toUpperCase()}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
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
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Current document file. Use the file upload section above to replace it with a new file.
            </p>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6">
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/medicalProfileVerification/viewMedicalProfile')}
                className="px-6 py-3 text-base font-medium transition-all duration-200 hover:shadow-md border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                ← Back to View Medical Page
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                className="px-6 py-3 text-base font-medium transition-all duration-200 hover:shadow-md border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/50"
              >
                💾 Save Draft
              </Button>
            </div>
            
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/medicalProfileVerification/viewMedicalProfile')}
                className="px-8 py-3 text-base font-medium transition-all duration-200 hover:shadow-md border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                  '✅ Update Profile'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
