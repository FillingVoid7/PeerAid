'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import medicalVerificationService from '@/lib/Services/medicalVerificationService';
import { IMedicalValidation } from '@/models/medicalValidation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, ConfirmationDialog } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loading } from '@/components/isLoading';


const VerifyMedicalProfile: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [allReports, setAllReports] = useState<IMedicalValidation[]>([]);
  const [filteredReports, setFilteredReports] = useState<IMedicalValidation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [counts, setCounts] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 });
  const [cacheTimestamp, setCacheTimestamp] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const CACHE_DURATION = 5 * 60 * 1000; 
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    reportId: string;
    patientName: string;
    action: 'verified' | 'rejected' | null;
    userId: string;
  }>({
    isOpen: false,
    reportId: '',
    patientName: '',
    action: null,
    userId: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      toast.error('Unauthorized access. Admin privileges required.');
      router.push('/');
      return;
    }
  }, [session, status, router]);

  const fetchMedicalReports = async (forceRefresh = false) => {
    const now = Date.now();
    const isCacheValid = cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION;
    
    if (!forceRefresh && isCacheValid && allReports.length > 0) {
      console.log('Using cached data');
      return;
    }

    try {
      setIsRefreshing(true);
      if (forceRefresh) {
        setLoading(true);
      }
      
      const statusFilter = filterStatus === 'all' ? undefined : filterStatus;
      const result = await medicalVerificationService.getAllMedicalReports(statusFilter);
      
      if (result.success && result.data) {
        const flattenedReports: IMedicalValidation[] = [];
        Object.values(result.data.reportsByUserId).forEach(userReports => {
          flattenedReports.push(...userReports);
        });
        
        setAllReports(flattenedReports);
        setTotalUsers(result.data.totalUsers);
        setCounts(result.data.counts);
        setCacheTimestamp(now);
        console.log('Data fetched and cached');
      } else {
        toast.error(result.message || 'Failed to fetch medical reports');
        setAllReports([]);
        setTotalUsers(0);
        setCounts({ total: 0, pending: 0, verified: 0, rejected: 0 });
      }
    } catch (error) {
      console.error('Error fetching medical reports:', error);
      toast.error('An error occurred while fetching medical reports');
      setAllReports([]);
      setTotalUsers(0);
      setCounts({ total: 0, pending: 0, verified: 0, rejected: 0 });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (session && session.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      fetchMedicalReports();
    }
  }, [session]);

  const handleManualRefresh = () => {
    fetchMedicalReports(true);
  };

  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredReports(allReports);
    } else {
      setFilteredReports(allReports.filter(report => 
        report.verificationInfo.verificationStatus === filterStatus
      ));
    }
    setCurrentPage(1); 
  }, [allReports, filterStatus]);

  const handleVerificationUpdate = async () => {
    if (!dialogState.action || !dialogState.userId) return;

    try {
      const result = await medicalVerificationService.updateVerificationStatus(
        dialogState.userId,
        dialogState.action
      );

      if (result.success) {
        toast.success(`Medical report ${dialogState.action} successfully`);
        await fetchMedicalReports(true); 
      } else {
        toast.error(result.message || 'Failed to update verification status');
      }
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast.error('An error occurred while updating verification status');
    } finally {
      setDialogState({
        isOpen: false,
        reportId: '',
        patientName: '',
        action: null,
        userId: ''
      });
    }
  };

  const openVerificationDialog = (
    report: IMedicalValidation,
    action: 'verified' | 'rejected'
  ) => {
    setDialogState({
      isOpen: true,
      reportId: report._id?.toString() || '',
      patientName: report.verificationInfo.patientName,
      action,
      userId: report.document_metadata.userId.toString()
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified':
        return 'default'; 
      case 'rejected':
        return 'destructive'; 
      case 'pending':
        return 'secondary'; 
      default:
        return 'outline';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading' || loading) {
    return <Loading fullScreen text="Loading medical reports..." />;
  }

  if (!session || session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return null; 
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Verify Medical Profiles
            </h1>
          </div>
          
          <div className="flex space-x-2 mt-12 mb-8 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="mr-2"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            {(['all', 'pending', 'verified', 'rejected'] as const).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{counts.total}</span> Total Reports
          </div>
          <div className="text-yellow-600 dark:text-yellow-400">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{counts.pending}</span> Pending
          </div>
          <div className="text-green-600 dark:text-green-400">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{counts.verified}</span> Verified
          </div>
          <div className="text-red-600 dark:text-red-400">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{counts.rejected}</span> Rejected
          </div>
        </div>
      </div>

      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No medical reports found for the selected filter.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6">
            {(() => {
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const paginatedReports = filteredReports.slice(startIndex, endIndex);
              
              return paginatedReports.map((report) => (
            <Card key={report._id?.toString() || Math.random().toString()} className="w-full">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">
                      {report.verificationInfo.patientName}
                    </CardTitle>
                    <CardDescription>
                      Document Type: {report.document_metadata.documentType.replace('_', ' ').toUpperCase()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                    <Badge variant={getStatusBadgeVariant(report.verificationInfo.verificationStatus)}>
                      {report.verificationInfo.verificationStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Healthcare Provider</h4>
                    <p className="text-sm">{report.document_metadata.healthcareProvider || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Date of Issue</h4>
                    <p className="text-sm">{formatDate(report.document_metadata.dateOfIssue)}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Valid Till</h4>
                    <p className="text-sm">{report.document_metadata.validTill ? formatDate(report.document_metadata.validTill) : 'Not specified'}</p>
                  </div>
                  
                  {report.verificationInfo.referenceID && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Reference ID</h4>
                      <p className="text-sm font-mono">{report.verificationInfo.referenceID}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Submitted</h4>
                    <p className="text-sm">{formatDate(report.createdAt || new Date())}</p>
                  </div>
                  
                  {report.verificationInfo.verifiedAt && (
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                        {report.verificationInfo.verificationStatus === 'verified' ? 'Verified' : 'Processed'} At
                      </h4>
                      <p className="text-sm">{formatDate(report.verificationInfo.verifiedAt)}</p>
                    </div>
                  )}
                </div>

                {report.uploadedFile && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Uploaded File</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      <a
                        href={report.uploadedFile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <span className="text-sm truncate">
                          {report.uploadedFile.fileName || 'Medical Document'} ({report.uploadedFile.type})
                        </span>
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-10 pt-4 border-t">
                    <>
                      <Button
                        onClick={() => openVerificationDialog(report, 'verified')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Verify
                      </Button>
                      <Button
                        onClick={() => openVerificationDialog(report, 'rejected')}
                        variant="destructive"
                      >
                        Reject 
                      </Button>
                    </>
                </div>
              </CardContent>
            </Card>
              ));
            })()}
          </div>
          
          {/* Pagination Controls */}
          {filteredReports.length > itemsPerPage && (
            <div className="flex items-center justify-between border-t pt-6">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredReports.length)} to {Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length} results
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {(() => {
                    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
                    const pages = [];
                    const startPage = Math.max(1, currentPage - 2);
                    const endPage = Math.min(totalPages, startPage + 4);
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={currentPage === i ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(i)}
                          className="min-w-[2.5rem]"
                        >
                          {i}
                        </Button>
                      );
                    }
                    return pages;
                  })()}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredReports.length / itemsPerPage)))}
                  disabled={currentPage === Math.ceil(filteredReports.length / itemsPerPage)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ ...dialogState, isOpen: false })}
        onConfirm={handleVerificationUpdate}
        title={`Confirm ${dialogState.action === 'verified' ? 'Verification' : 'Rejection'}`}
        message={`Are you sure you want to ${dialogState.action === 'verified' ? 'verify' : 'reject'} the medical report for ${dialogState.patientName}?`}
        confirmText={dialogState.action === 'verified' ? 'Verify' : 'Reject'}
        variant={dialogState.action === 'verified' ? 'default' : 'destructive'}
      />
    </div>
  );
};

export default VerifyMedicalProfile;
