'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/isLoading';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Heart, 
  Stethoscope, 
  AlertTriangle, 
  Pill,
  FileText,
  Phone,
  Mail,
  MapPin
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

export default function UpdateProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState<Partial<HealthProfile>>({});

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/get-profile/${session.user.id}`, {
        cache: 'no-store'
      });
      const data = await response.json();
      
      if (response.ok && data.profile) {
        setProfile(data.profile);
        setFormData(data.profile);
      } else {
        toast.error('Failed to load profile');
        router.push('/healthProfile/viewProfile');
      }
    } catch (error) {
      toast.error('Error loading profile');
      router.push('/healthProfile/viewProfile');
    }
  };

  const handleInputChange = (field: string, value: any, isNested = false, parentField?: string) => {
    setFormData(prev => {
      if (isNested && parentField) {
        return {
          ...prev,
          [parentField]: {
            ...(prev[parentField as keyof HealthProfile] as any),
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleUpdate = async () => {
    if (!session?.user?.id) return;
    
    setUpdating(true);
    
    try {
      const response = await fetch(`/api/get-profile/${session.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast.success('Profile updated successfully');
        router.push('/healthProfile/viewProfile');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
      console.error('Update error:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-slate-900 dark:via-background dark:to-indigo-950 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">Please log in to access your profile.</p>
            <Button onClick={() => router.push('/auth/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-slate-900 dark:via-background dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" onClick={() => router.push('/healthProfile/viewProfile')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Your Health Profile
          </h1>
          <p className="text-muted-foreground mt-2">Update your health information</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Personal Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Role *</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                  value={formData.role || ''}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                >
                  <option value="seeker">Seeker</option>
                  <option value="guide">Guide</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Age *</label>
                <input
                  type="number"
                  min="13"
                  max="120"
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                  value={formData.age || ''}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || '')}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Gender *</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                  value={formData.gender || ''}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer not to say">Prefer not to say</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Blood Type *</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                  value={formData.bloodType || ''}
                  onChange={(e) => handleInputChange('bloodType', e.target.value)}
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Nationality</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                  value={formData.nationality || ''}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  placeholder="Enter nationality"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter location"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                  value={formData.contactInfo?.contact_phone || ''}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value, true, 'contactInfo')}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2 bg-background"
                  value={formData.contactInfo?.contact_email || ''}
                  onChange={(e) => handleInputChange('contact_email', e.target.value, true, 'contactInfo')}
                  placeholder="Enter email address"
                />
              </div>
            </CardContent>
          </Card>

          {/* Health Condition */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Health Condition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Condition Category</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 bg-background"
                    value={formData.conditionCategory || ''}
                    onChange={(e) => handleInputChange('conditionCategory', e.target.value)}
                  >
                    <option value="">Select Category</option>
                    <option value="skin">Skin</option>
                    <option value="internal">Internal</option>
                    <option value="mental">Mental</option>
                    <option value="reproductive">Reproductive</option>
                    <option value="chronic">Chronic</option>
                    <option value="infectious">Infectious</option>
                    <option value="genetic">Genetic</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Condition Name</label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 bg-background"
                    value={formData.conditionName || ''}
                    onChange={(e) => handleInputChange('conditionName', e.target.value)}
                    placeholder="Enter condition name"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Condition Description</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 bg-background min-h-24"
                  value={formData.conditionDescription || ''}
                  onChange={(e) => handleInputChange('conditionDescription', e.target.value)}
                  placeholder="Describe your condition..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Onset Year</label>
                  <input
                    type="number"
                    min="1900"
                    max="2030"
                    className="w-full border rounded-lg px-3 py-2 bg-background"
                    value={formData.onsetYear || ''}
                    onChange={(e) => handleInputChange('onsetYear', parseInt(e.target.value) || '')}
                    placeholder="2020"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Onset Month</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 bg-background"
                    value={formData.onsetMonth || ''}
                    onChange={(e) => handleInputChange('onsetMonth', parseInt(e.target.value) || '')}
                  >
                    <option value="">Select Month</option>
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Resolved Year</label>
                  <input
                    type="number"
                    min="1900"
                    max="2030"
                    className="w-full border rounded-lg px-3 py-2 bg-background"
                    value={formData.resolvedYear || ''}
                    onChange={(e) => handleInputChange('resolvedYear', parseInt(e.target.value) || '')}
                    placeholder="2023"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Resolved Month</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 bg-background"
                    value={formData.resolvedMonth || ''}
                    onChange={(e) => handleInputChange('resolvedMonth', parseInt(e.target.value) || '')}
                  >
                    <option value="">Select Month</option>
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  {updating ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/healthProfile/viewProfile')}
                  disabled={updating}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
