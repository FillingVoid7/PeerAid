'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/dialog';
import medicalVerificationService from '@/lib/Services/medicalVerificationService';
import { IMedicalValidation } from '@/models/medicalValidation';
import { DashboardBreadcrumb } from '@/components/ui/dashboard-breadcrumb';
import { ModeToggle } from '@/components/ui/ThemeToggle';

export default function ViewMedicalProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [medicalReport, setMedicalReport] = useState<IMedicalValidation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
      if (result.success) {
        setMedicalReport(result.report || null);
      } else {
        toast.error(result.message || 'Failed to load medical report');
      }
    } catch (error) {
      console.error('Error loading medical report:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!session?.user?.id || !medicalReport) return;

    setIsDeleting(true);
    try {
      const result = await medicalVerificationService.deleteMedicalReport(session.user.id);
      if (result.success) {
        toast.success('Medical report deleted successfully');
        setMedicalReport(null);
        setShowDeleteDialog(false);
      } else {
        toast.error(result.message || 'Failed to delete medical report');
      }
    } catch (error) {
      console.error('Error deleting medical report:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/30';
      case 'rejected':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/30';
      case 'pending':
      default:
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950/30';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 -py-2">
      <div className="max-w-7xl mx-auto p-6 space-y-10">

        {/* Breadcrumb */}
          <div className="flex justify-start">
                <DashboardBreadcrumb />
          </div>
        
        <div className="text-center mb-16 mt-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
            <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Medical Profile</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            View your medical verification status and documents
          </p>
        </div>

        {!medicalReport ? (
          <Card className="text-center py-2 shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent>
              <div className="mx-auto w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">No Medical Profile Found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg max-w-md mx-auto">
                You haven&apos;t uploaded any medical documents yet. Create your medical profile to get started with verification.
              </p>
              <Button
                onClick={() => router.push('/medicalProfileVerification/createMedicalProfile')}
                className="px-8 py-3 text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Create Medical Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Verification Status */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-2xl text-gray-900 dark:text-gray-100">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-950/50 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Verification Status
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(medicalReport.verificationInfo.verificationStatus)}`}>
                    {medicalReport.verificationInfo.verificationStatus.toUpperCase()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Patient Name</p>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{medicalReport.verificationInfo.patientName}</p>
                  </div>
                  {medicalReport.verificationInfo.referenceID && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference ID</p>
                      <p className="text-lg text-gray-900 dark:text-gray-100">{medicalReport.verificationInfo.referenceID}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Verified</p>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{medicalReport.verificationInfo.isVerified ? 'Yes' : 'No'}</p>
                  </div>
                  {medicalReport.verificationInfo.verifiedAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Verified At</p>
                      <p className="text-lg text-gray-900 dark:text-gray-100">{formatDate(medicalReport.verificationInfo.verifiedAt)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Document Information */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-2xl text-gray-900 dark:text-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Document Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Document Type</p>
                    <p className="text-lg text-gray-900 dark:text-gray-100 capitalize">{medicalReport.document_metadata.documentType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Issue</p>
                    <p className="text-lg text-gray-900 dark:text-gray-100">{formatDate(medicalReport.document_metadata.dateOfIssue)}</p>
                  </div>
                  {medicalReport.document_metadata.DOB && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</p>
                      <p className="text-lg text-gray-900 dark:text-gray-100">{formatDate(medicalReport.document_metadata.DOB)}</p>
                    </div>
                  )}
                  {medicalReport.document_metadata.validTill && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Valid Till</p>
                      <p className="text-lg text-gray-900 dark:text-gray-100">{formatDate(medicalReport.document_metadata.validTill)}</p>
                    </div>
                  )}
                  {medicalReport.document_metadata.healthcareProvider && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Healthcare Provider</p>
                      <p className="text-lg text-gray-900 dark:text-gray-100">{medicalReport.document_metadata.healthcareProvider}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Uploaded File */}
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-2xl text-gray-900 dark:text-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-950/50 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </div>
                  Uploaded Document
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                        {medicalReport.uploadedFile.type.toUpperCase()} • 
                        {medicalReport.uploadedFile.fileSize ? ` ${(medicalReport.uploadedFile.fileSize / 1024 / 1024).toFixed(2)} MB` : ''}
                      </p>
                    </div>
                  </div>
                  <Button
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
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6">
              <Button
                variant="outline"
                onClick={() => router.push('/medicalProfileVerification/updateMedicalProfile')}
                className="px-8 py-3 text-base font-medium transition-all duration-200 hover:shadow-md border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Update Profile
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
                className="px-8 py-3 text-base font-medium bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </div>
                ) : (
                  'Delete Profile'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Delete Medical Profile"
          message="Are you sure you want to delete your medical profile? This action cannot be undone and you will need to create a new profile to upload medical documents again."
          confirmText="Delete Profile"
          cancelText="Cancel"
          variant="destructive"
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}
