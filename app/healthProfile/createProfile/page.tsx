"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Components
import RoleTabs from "@/components/profile/RoleTabs";
import ProgressIndicator from "@/components/profile/ProgressIndicator";
import PersonalInfoStep, { PersonalInfoData } from "@/components/profile/PersonalInfoStep";
import MedicalConditionStep, { MedicalConditionData } from "@/components/profile/MedicalConditionStep";
import SymptomsStep, { SymptomsData } from "@/components/profile/SymptomsStep";
import DiagnosisStep, { DiagnosisData } from "@/components/profile/DiagnosisStep";
import TreatmentsStep, { TreatmentsData } from "@/components/profile/TreatmentsStep";
import ReviewStep from "@/components/profile/ReviewStep";

// Services
import profileService, { ProfileFormData } from "@/lib/profileService";

// Types
import { UserRole } from "@/models/types/profile.type";

const steps = ["Personal Info", "Medical Condition", "Symptoms", "Diagnosis", "Treatments", "Review"];

export default function ProfileSetup() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // State management
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data states
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
    age: '',
    gender: '',
    nationality: '',
    location: '',
    bloodType: '',
    contactInfo: {
      contact_phone: '',
      contact_email: '',
    },
  });

  const [medicalCondition, setMedicalCondition] = useState<MedicalConditionData>({
    conditionCategory: '',
    conditionName: '',
    conditionDescription: '',
    onsetDate: '',
    resolvedDate: '',
  });

  const [symptoms, setSymptoms] = useState<SymptomsData>({
    symptoms: [],
  });

  const [diagnosis, setDiagnosis] = useState<DiagnosisData>({
    diagnosed: false,
    date: '',
    diagnosedBy: '',
    conditionName: '',
    certainty: 'suspected',
    notes: '',
  });

  const [treatments, setTreatments] = useState<TreatmentsData>({
    treatments: [],
  });

  // Check authentication
  // useEffect(() => {
  //   if (status === "loading") return; // Still loading
    
  //   if (!session) {
  //     router.push("/auth/login");
  //     return;
  //   }
  // }, [session, status, router]);

  // Load draft data on component mount
  useEffect(() => {
    const draft = profileService.loadDraft();
    if (draft && draft.role) {
      setSelectedRole(draft.role);
    }
  }, []);

  // Save draft on form changes (simplified)
  useEffect(() => {
    if (selectedRole && personalInfo.age) {
      // Simple draft saving without full type validation
      const simpleDraft = {
        role: selectedRole,
        conditionCategory: medicalCondition.conditionCategory,
        conditionName: medicalCondition.conditionName,
      };
      profileService.saveDraft(simpleDraft);
    }
  }, [selectedRole, personalInfo.age, medicalCondition.conditionCategory, medicalCondition.conditionName]);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setCurrentStep(0); // Reset to first step when role changes
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!session?.user || !selectedRole) return;

    setIsSubmitting(true);

    try {
      // Prepare form data
      const profileData: ProfileFormData = {
        userId: session.user.id as any, // Type conversion for ObjectId
        role: selectedRole,
        
        // Personal info
        age: Number(personalInfo.age),
        gender: personalInfo.gender as any,
        Nationality: personalInfo.nationality,
        Location: personalInfo.location,
        bloodType: personalInfo.bloodType as any,
        contactInfo: personalInfo.contactInfo,

        // Medical condition
        conditionCategory: medicalCondition.conditionCategory,
        conditionName: medicalCondition.conditionName,
        conditionDescription: medicalCondition.conditionDescription,
        onsetDate: new Date(medicalCondition.onsetDate),
        resolvedDate: medicalCondition.resolvedDate ? new Date(medicalCondition.resolvedDate) : undefined,

        // Symptoms
        symptoms: symptoms.symptoms,

        // Diagnosis
        diagnosis: {
          ...diagnosis,
          date: diagnosis.date,
        },

        // Treatments
        treatments: treatments.treatments,

        // Default values
        isVerified: false,
        verificationMethod: 'self-Declared',
      };

      // Validate before submitting
      const validation = profileService.validateProfile(profileData);
      if (!validation.isValid) {
        alert(`Please fix the following errors:\n${validation.errors.join('\n')}`);
        setIsSubmitting(false);
        return;
      }

      // Submit profile
      const result = await profileService.profileSetup(profileData);

      if (result.success) {
        // Clear draft data
        profileService.clearDraft();
        
        // Show success message
        alert('Profile created successfully!');
        
        // Redirect to profile view or dashboard
        router.push('/healthProfile/viewProfile');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Profile submission error:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Render main component
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Health Profile</h1>
          <p className="text-gray-600">
            Share your health journey to connect with others and build a supportive community.
          </p>
        </div>

        {/* Role Selection */}
        <RoleTabs selectedRole={selectedRole} onRoleChange={handleRoleChange} />

        {selectedRole && (
          <>
            {/* Progress Indicator */}
            <ProgressIndicator steps={steps} currentStep={currentStep} />

            {/* Form Steps */}
            <div className="bg-white rounded-lg shadow-sm">
              {currentStep === 0 && (
                <PersonalInfoStep
                  data={personalInfo}
                  onChange={setPersonalInfo}
                  onNext={handleNext}
                />
              )}

              {currentStep === 1 && (
                <MedicalConditionStep
                  data={medicalCondition}
                  onChange={setMedicalCondition}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 2 && (
                <SymptomsStep
                  data={symptoms}
                  onChange={setSymptoms}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === 3 && (
                <DiagnosisStep
                  data={diagnosis}
                  onChange={setDiagnosis}
                  onNext={handleNext}
                  onBack={handleBack}
                  role={selectedRole}
                />
              )}

              {currentStep === 4 && (
                <TreatmentsStep
                  data={treatments}
                  onChange={setTreatments}
                  onNext={handleNext}
                  onBack={handleBack}
                  role={selectedRole}
                />
              )}

              {currentStep === 5 && (
                <ReviewStep
                  personalInfo={personalInfo}
                  medicalCondition={medicalCondition}
                  symptoms={symptoms}
                  diagnosis={diagnosis}
                  treatments={treatments}
                  role={selectedRole}
                  onBack={handleBack}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}