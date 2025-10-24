'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/isLoading';
import { toast } from 'sonner';
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Heart, 
  AlertTriangle, 
  Activity,
  Stethoscope,
  Pill,
  Trash2,
  Shield,
  Clock,
  FileText,
  Target,
  Edit,
  X,
  AlertCircle,
  Tag,
  Home,
  ArrowLeft
} from 'lucide-react';
import { DashboardBreadcrumb } from '@/components/ui/dashboard-breadcrumb';

interface HealthProfile {
  _id: string;
  userId: string;
  role: 'seeker' | 'guide';
  
  // Personal Information
  age: number;
  gender: string;
  nationality?: string;
  location?: string;
  bloodType: string;
  contactInfo?: {
    contact_phone?: string;
    contact_email?: string;
  };
  
  // Health Condition Information
  conditionCategory?: string;
  conditionName?: string;
  conditionDescription?: string;
  onsetYear?: number;
  onsetMonth?: number;
  resolvedYear?: number;
  resolvedMonth?: number;
  
  // Symptoms
  symptoms?: Array<{
    name_of_symptoms: string;
    severity: 'mild' | 'moderate' | 'severe';
    frequency?: 'rarely' | 'sometimes' | 'often' | 'constant';
    symptomDuration?: string;
    symptomNotes?: string;
  }>;
  
  // Diagnosis
  diagnosis?: {
    diagnosed: boolean;
    diagnosedYear?: number;
    diagnosedBy?: string;
    certainty?: 'suspected' | 'probable' | 'confirmed';
    diagnosisNotes?: string;
  };
  
  // Treatments
  treatments?: Array<{
    treatmentName?: string;
    treatmentType?: 'medication' | 'therapy' | 'surgery' | 'lifestyle changes' | 'alternative';
    treatmentDuration?: string;
    treatmentEffectiveness?: 'effective' | 'somewhat effective' | 'not effective' | 'very effective';
    treatmentNotes?: string;
  }>;
  
  // Verification
  isVerified: boolean;
  verificationMethod?: string;
  verificationDate?: string;
  
  // Meta
  createdAt: string;
  updatedAt: string;
}

const ViewProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const hasLoadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }
    
    if (!hasLoadedRef.current || hasLoadedRef.current !== session.user.id) {
      fetchProfile();
    } else if (hasLoadedRef.current === session.user.id && !profile) {
      fetchProfile();
    }
  }, [session?.user?.id, status]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/get-profile/${session.user.id}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'max-age=300, stale-while-revalidate=60',
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        let profileData = data.profile;
        
        if (profileData) {
          try {
            const medicalValidationResponse = await fetch(`/api/medical_verification/view_details/${session.user.id}`,{
              method: 'GET', 
              headers: {
                'Content-Type': 'application/json',
              }
            });

            if (medicalValidationResponse.ok) {
              const validationData = await medicalValidationResponse.json();
              console.log('Fetched medical validation data:', validationData);
              
              const hasAcceptedValidation = validationData.report?.verificationInfo?.verificationStatus === 'verified';
              
              console.log('Has accepted validation:', hasAcceptedValidation);
              console.log('Current verification method:', profileData.verificationMethod);
              
              if (hasAcceptedValidation && profileData.verificationMethod !== 'medical-document') {
                console.log('Updating verification method to medical-document');
                profileData.verificationMethod = 'medical-document';
                
                const updateResponse = await fetch(`/api/get-profile/${session.user.id}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    verificationMethod: 'medical-document'
                  })
                });
                
                if (updateResponse.ok) {
                  console.log('Successfully updated verification method in database');
                } else {
                  console.error('Failed to update verification method in database');
                }
              }
            }
          } catch (medicalError) {
            console.log('Medical validation check failed, continuing with profile display:', medicalError);
          }
        }
        
        setProfile(profileData);
        hasLoadedRef.current = session.user.id; 
      } else {
        toast.error(data.message || 'Failed to load profile');
      }
    } catch (error) {
      toast.error('Error loading profile');
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!session?.user?.id || !profile) return;
    
    setDeleting(true);
    
    try {
      const response = await fetch(`/api/get-profile/${session.user.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Profile deleted successfully');
        router.push('/healthProfile/createProfile');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete profile');
      }
    } catch (error) {
      toast.error('Error deleting profile');
      console.error('Delete error:', error);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (year?: number, month?: number) => {
    if (!year) return 'Not specified';
    if (!month) return year.toString();
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${monthNames[month - 1]} ${year}`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'severe': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case 'very effective': return 'text-green-700 bg-green-100';
      case 'effective': return 'text-green-600 bg-green-50';
      case 'somewhat effective': return 'text-yellow-600 bg-yellow-50';
      case 'not effective': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const safeRenderValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'object') {
      if (value.enum && Array.isArray(value.enum)) {
        return value.enum[0] || '';
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  if (status === 'loading' || loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <FileText className="w-6 h-6" />
              No Profile Found
            </CardTitle>
            <CardDescription>
              You haven&apos;t created a health profile yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/healthProfile/createProfile')}>
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/50">
      <div className="container mx-auto px-4 py-6 ">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex justify-start">
            <DashboardBreadcrumb />
          </div>
          
          {/* Header */}
          <div className="text-center space-y-6 ">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Health Profile
            </h1>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Role:</span>
                  <span className={`capitalize font-medium px-3 py-1 rounded-full text-sm ${
                    profile.role === 'guide' 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                      : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                  }`}>
                    {profile.role}
                  </span>
                </div>
                {profile.isVerified && (
                  <div className="flex items-center gap-2 text-green-600 bg-gradient-to-r from-green-50 to-emerald-50 px-2 py-1 rounded-full text-xs border border-green-200">
                    <Shield className="w-3 h-3" />
                    <span className="font-medium">Verified</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-center sm:justify-end">
                <Button 
                  onClick={() => router.push('/healthProfile/updateProfile')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  size="sm"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  onClick={() => setShowDeleteDialog(true)}
                  variant="destructive"
                  disabled={deleting}
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

        {/* Section 1: Personal Information and Health Condition */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-t-xl pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Age:</span>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">{profile.age} years old</span>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-purple-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Gender:</span>
                  <span className="text-base font-semibold text-gray-900 dark:text-white capitalize">{profile.gender}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Blood Type:</span>
                  <span className="font-mono bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded text-sm font-bold">
                    {profile.bloodType}
                  </span>
                </div>

                {profile.nationality && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Nationality:</span>
                    <span className="text-base font-semibold text-gray-900 dark:text-white">{profile.nationality}</span>
                  </div>
                )}

                {profile.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Location:</span>
                    <span className="text-base font-semibold text-gray-900 dark:text-white">{profile.location}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Health Condition */}
          {(profile.conditionCategory || profile.conditionName || profile.conditionDescription) && (
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 rounded-t-xl pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Stethoscope className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  Health Condition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="space-y-3">
                  {profile.conditionCategory && (
                    <div className="flex items-center gap-3">
                      <Tag className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Category:</span>
                      <span className="capitalize bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm font-medium border border-purple-200 dark:border-purple-700">
                        {String(profile.conditionCategory)}
                      </span>
                    </div>
                  )}

                  {profile.conditionName && (
                    <div className="flex items-center gap-3">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Condition Name:</span>
                      <span className="text-base font-semibold text-gray-900 dark:text-white">{String(profile.conditionName)}</span>
                    </div>
                  )}

                  {profile.conditionDescription && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-gray-600 mt-0.5" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Description:</span>
                      <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {String(profile.conditionDescription)}
                      </div>
                    </div>
                  )}

                  {profile.onsetYear && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Onset Date:</span>
                      <span className="text-base font-semibold text-gray-900 dark:text-white">{formatDate(profile.onsetYear, profile.onsetMonth)}</span>
                    </div>
                  )}

                  {profile.resolvedYear && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Resolved Date:</span>
                      <span className="text-base font-semibold text-gray-900 dark:text-white">{formatDate(profile.resolvedYear, profile.resolvedMonth)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Information - Full Width */}
        {(profile.contactInfo?.contact_phone || profile.contactInfo?.contact_email) && (
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 rounded-t-xl pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="space-y-3">
                {profile.contactInfo.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-600 dark:text-gray-300 text-sm">Phone:</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{profile.contactInfo.contact_phone}</span>
                  </div>
                )}
                {profile.contactInfo.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-600 dark:text-gray-300 text-sm">Email:</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{profile.contactInfo.contact_email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 2: Symptoms and Diagnosis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Symptoms */}
          {profile.symptoms && profile.symptoms.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-700 dark:to-slate-600 rounded-t-xl pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  Symptoms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="space-y-4">
                  {profile.symptoms.map((symptom, index) => (
                    <div key={index} className="pb-3 border-b border-gray-200 dark:border-slate-600 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                          <h4 className="font-medium text-base text-gray-900 dark:text-white">{String(symptom.name_of_symptoms || '')}</h4>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(safeRenderValue(symptom.severity || ''))}`}>
                          {safeRenderValue(symptom.severity || '')}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm ml-6">
                        {symptom.frequency && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium text-gray-600 dark:text-gray-300">Frequency:</span>
                            <span className="text-gray-900 dark:text-white capitalize">{safeRenderValue(symptom.frequency)}</span>
                          </div>
                        )}
                        {symptom.symptomDuration && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium text-gray-600 dark:text-gray-300">Duration:</span>
                            <span className="text-gray-900 dark:text-white">{String(symptom.symptomDuration)}</span>
                          </div>
                        )}
                      </div>
                      
                      {symptom.symptomNotes && (
                        <div className="mt-2 ml-6">
                          <span className="font-medium text-gray-600 dark:text-gray-300 text-sm">Notes:</span>
                          <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm leading-relaxed">{String(symptom.symptomNotes)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Diagnosis */}
          {profile.diagnosis && profile.diagnosis.diagnosed && (
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-slate-700 dark:to-slate-600 rounded-t-xl pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  Diagnosis Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="space-y-3">
                  {profile.diagnosis.diagnosedBy && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Diagnosed by:</span>
                      <span className="text-base font-semibold text-gray-900 dark:text-white">{String(profile.diagnosis.diagnosedBy)}</span>
                    </div>
                  )}
                  
                  {profile.diagnosis.diagnosedYear && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Diagnosis Date:</span>
                      <span className="text-base font-semibold text-gray-900 dark:text-white">{String(profile.diagnosis.diagnosedYear)}</span>
                    </div>
                  )}

                  {profile.diagnosis.certainty && (
                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Certainty:</span>
                      <span className="text-base font-semibold text-gray-900 dark:text-white capitalize">{safeRenderValue(profile.diagnosis.certainty)}</span>
                    </div>
                  )}
                  
                  {profile.diagnosis.diagnosisNotes && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-gray-600 mt-0.5" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Notes:</span>
                      <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {String(profile.diagnosis.diagnosisNotes)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Section 3: Treatment and Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Treatments */}
          {profile.treatments && profile.treatments.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 rounded-t-xl pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Pill className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  Treatment History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="space-y-4">
                  {profile.treatments.map((treatment, index) => (
                    <div key={index} className="pb-3 border-b border-gray-200 dark:border-slate-600 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-green-600 mt-0.5" />
                          <h4 className="font-medium text-base text-gray-900 dark:text-white">
                            {treatment.treatmentName && safeRenderValue(treatment.treatmentName).trim() !== '' 
                              ? safeRenderValue(treatment.treatmentName) 
                              : `Treatment ${index + 1}`}
                          </h4>
                        </div>
                        {treatment.treatmentEffectiveness && safeRenderValue(treatment.treatmentEffectiveness).trim() !== '' && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEffectivenessColor(safeRenderValue(treatment.treatmentEffectiveness))}`}>
                            {safeRenderValue(treatment.treatmentEffectiveness)}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm ml-6">
                        {treatment.treatmentType && safeRenderValue(treatment.treatmentType).trim() !== '' && (
                          <div className="flex items-center gap-2">
                            <Tag className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium text-gray-600 dark:text-gray-300">Type:</span>
                            <span className="text-gray-900 dark:text-white capitalize">{safeRenderValue(treatment.treatmentType)}</span>
                          </div>
                        )}
                        {treatment.treatmentDuration && safeRenderValue(treatment.treatmentDuration).trim() !== '' && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium text-gray-600 dark:text-gray-300">Duration:</span>
                            <span className="text-gray-900 dark:text-white">{safeRenderValue(treatment.treatmentDuration)}</span>
                          </div>
                        )}
                      </div>
                      
                      {treatment.treatmentNotes && safeRenderValue(treatment.treatmentNotes).trim() !== '' && (
                        <div className="mt-2 ml-6">
                          <span className="font-medium text-gray-600 dark:text-gray-300 text-sm">Notes:</span>
                          <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm leading-relaxed">{safeRenderValue(treatment.treatmentNotes)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profile Metadata */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-slate-700 dark:to-slate-600 rounded-t-xl pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-gray-100 dark:bg-gray-900 rounded-lg">
                  <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Created:</span>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Last Updated:</span>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">{new Date(profile.updatedAt).toLocaleDateString()}</span>
                </div>
                
                {profile.verificationMethod && (
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Verification Method:</span>
                    <span className="text-base font-semibold text-gray-900 dark:text-white capitalize">{String(profile.verificationMethod).replace('_', ' ')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteDialog(false)}
          />
          
          {/* Dialog */}
          <Card className="relative z-10 w-full max-w-md mx-4 shadow-2xl border-red-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  Delete Profile
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleting}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription className="text-red-600 font-medium">
                This action cannot be undone!
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-800 font-medium mb-2">
                  This will permanently delete:
                </p>
                <ul className="text-sm text-red-700 space-y-1 ml-4 list-disc">
                  <li>All your personal information</li>
                  <li>Health condition details</li>
                  <li>Symptoms and treatment history</li>
                  <li>All associated data</li>
                </ul>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteProfile}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Forever
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
};

export default ViewProfilePage;
