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
  AlertCircle
} from 'lucide-react';

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
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }
    
    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/get-profile/${session.user.id}`, {
        cache: 'no-store' 
      });
      const data = await response.json();
      
      if (!mountedRef.current) return;
      
      if (response.ok) {
        setProfile(data.profile);
      } else {
        toast.error(data.message || 'Failed to load profile');
      }
    } catch (error) {
      if (mountedRef.current) {
        toast.error('Error loading profile');
        console.error('Profile fetch error:', error);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleDeleteProfile = async () => {
    if (!session?.user?.id || !profile) return;
    
    setDeleting(true);
    
    try {
      const response = await fetch(`/api/get-profile/${session.user.id}`, {
        method: 'DELETE',
      });
      
      if (!mountedRef.current) return;
      
      if (response.ok) {
        toast.success('Profile deleted successfully');
        router.push('/healthProfile/createProfile');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete profile');
      }
    } catch (error) {
      if (mountedRef.current) {
        toast.error('Error deleting profile');
        console.error('Delete error:', error);
      }
    } finally {
      if (mountedRef.current) {
        setDeleting(false);
        setShowDeleteDialog(false);
      }
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
              You haven't created a health profile yet.
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="space-y-3">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Your Health Profile
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Role:</span>
                  <span className={`capitalize font-semibold px-4 py-2 rounded-full text-sm shadow-sm ${
                    profile.role === 'guide' 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200' 
                      : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200'
                  }`}>
                    {profile.role}
                  </span>
                </div>
                {profile.isVerified && (
                  <div className="flex items-center gap-2 text-green-600 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-full text-sm border border-green-200 shadow-sm">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Verified Profile</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => router.push('/healthProfile/updateProfile')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200"
                size="lg"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button 
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
                disabled={deleting}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200"
                size="lg"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Profile
              </Button>
            </div>
          </div>

        {/* Personal Information */}
        <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 rounded-t-xl">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-300">Age:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">{profile.age} years old</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <User className="w-5 h-5 text-purple-500" />
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-300">Gender:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white capitalize">{profile.gender}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <Heart className="w-5 h-5 text-red-500" />
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-300">Blood Type:</span>
                  <span className="ml-2 font-mono bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full font-bold">
                    {profile.bloodType}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {profile.nationality && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-500" />
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Nationality:</span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">{profile.nationality}</span>
                  </div>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Location:</span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">{profile.location}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        {(profile.contactInfo?.contact_phone || profile.contactInfo?.contact_email) && (
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-8">
              {profile.contactInfo.contact_phone && (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-slate-700 rounded-lg border border-green-200 dark:border-slate-600">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Phone:</span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">{profile.contactInfo.contact_phone}</span>
                  </div>
                </div>
              )}
              {profile.contactInfo.contact_email && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-slate-700 rounded-lg border border-blue-200 dark:border-slate-600">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="font-medium text-gray-600 dark:text-gray-300">Email:</span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">{profile.contactInfo.contact_email}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Health Condition */}
        {(profile.conditionCategory || profile.conditionName || profile.conditionDescription) && (
          <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-600 rounded-t-xl">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                Health Condition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              {profile.conditionCategory && (
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Category:</span>
                  <span className="capitalize bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-200 px-4 py-2 rounded-full text-sm font-semibold border border-purple-200 dark:border-purple-700">
                    {profile.conditionCategory}
                  </span>
                </div>
              )}
              {profile.conditionName && (
                <div className="p-4 bg-purple-50 dark:bg-slate-700 rounded-lg border border-purple-200 dark:border-slate-600">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Condition:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">{profile.conditionName}</span>
                </div>
              )}
              {profile.conditionDescription && (
                <div className="space-y-2">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Description:</span>
                  <div className="mt-2 text-gray-700 dark:text-gray-300 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 p-6 rounded-xl border border-gray-200 dark:border-slate-600 leading-relaxed">
                    {profile.conditionDescription}
                  </div>
                </div>
              )}
              
              {(profile.onsetYear || profile.resolvedYear) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {profile.onsetYear && (
                    <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-slate-700 rounded-lg border border-orange-200 dark:border-slate-600">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-300">Onset:</span>
                        <span className="ml-2 font-semibold text-gray-900 dark:text-white">{formatDate(profile.onsetYear, profile.onsetMonth)}</span>
                      </div>
                    </div>
                  )}
                  {profile.resolvedYear && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-slate-700 rounded-lg border border-green-200 dark:border-slate-600">
                      <Clock className="w-5 h-5 text-green-600" />
                      <div>
                        <span className="font-medium text-gray-600 dark:text-gray-300">Resolved:</span>
                        <span className="ml-2 font-semibold text-gray-900 dark:text-white">{formatDate(profile.resolvedYear, profile.resolvedMonth)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Symptoms */}
        {profile.symptoms && profile.symptoms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Symptoms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {profile.symptoms.map((symptom, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{symptom.name_of_symptoms}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(symptom.severity)}`}>
                        {symptom.severity}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {symptom.frequency && (
                        <div>
                          <span className="font-medium">Frequency:</span> {symptom.frequency}
                        </div>
                      )}
                      {symptom.symptomDuration && (
                        <div>
                          <span className="font-medium">Duration:</span> {symptom.symptomDuration}
                        </div>
                      )}
                    </div>
                    
                    {symptom.symptomNotes && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Notes:</span>
                        <p className="text-muted-foreground mt-1">{symptom.symptomNotes}</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Diagnosis Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.diagnosis.diagnosedBy && (
                <div>
                  <span className="font-medium">Diagnosed by:</span>
                  <span className="ml-2">{profile.diagnosis.diagnosedBy}</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.diagnosis.diagnosedYear && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Diagnosis Date:</span>
                    <span>{profile.diagnosis.diagnosedYear}</span>
                  </div>
                )}
                {profile.diagnosis.certainty && (
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Certainty:</span>
                    <span className="capitalize">{profile.diagnosis.certainty}</span>
                  </div>
                )}
              </div>
              
              {profile.diagnosis.diagnosisNotes && (
                <div>
                  <span className="font-medium">Notes:</span>
                  <p className="mt-1 text-muted-foreground bg-gray-50 p-3 rounded">
                    {profile.diagnosis.diagnosisNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Treatments */}
        {profile.treatments && profile.treatments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Treatment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {profile.treatments.map((treatment, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">
                        {treatment.treatmentName || `Treatment ${index + 1}`}
                      </h4>
                      {treatment.treatmentEffectiveness && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffectivenessColor(treatment.treatmentEffectiveness)}`}>
                          {treatment.treatmentEffectiveness}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {treatment.treatmentType && (
                        <div>
                          <span className="font-medium">Type:</span> 
                          <span className="ml-1 capitalize">{treatment.treatmentType}</span>
                        </div>
                      )}
                      {treatment.treatmentDuration && (
                        <div>
                          <span className="font-medium">Duration:</span> {treatment.treatmentDuration}
                        </div>
                      )}
                    </div>
                    
                    {treatment.treatmentNotes && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium">Notes:</span>
                        <p className="text-muted-foreground mt-1">{treatment.treatmentNotes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Created:</span>
                <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Last Updated:</span>
                <span>{new Date(profile.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            {profile.verificationMethod && (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Verification Method:</span>
                <span className="capitalize">{profile.verificationMethod.replace('_', ' ')}</span>
              </div>
            )}
          </CardContent>
        </Card>
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
