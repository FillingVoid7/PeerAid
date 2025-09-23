"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import RoleTabs from "@/components/profile/RoleTabs";
import PersonalInfoStep, { PersonalInfoData } from "@/components/profile/PersonalInfoStep";
import MedicalConditionStep, { MedicalConditionData } from "@/components/profile/MedicalConditionStep";
import SymptomsStep, { SymptomsData } from "@/components/profile/SymptomsStep";
import DiagnosisTreatmentStep, { DiagnosisTreatmentData } from "@/components/profile/DiagnosisTreatmentStep";
import ReviewStep from "@/components/profile/ReviewStep";
import ProgressIndicator, { defaultSteps } from "@/components/profile/progressIndication";
import { UserRole } from "@/models/types/profile.type";
import { LoadingSpinner } from "@/components/isLoading";
import profileService from "@/lib/profileService";

export default function ProfileSetup() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    onsetYear: new Date().getFullYear(),
    conditionDescription: '',
  });

  const [symptoms, setSymptoms] = useState<SymptomsData>({
    name_of_symptoms: '',
    severity: 'mild',
  });

  const [diagnosisTreatment, setDiagnosisTreatment] = useState<DiagnosisTreatmentData>({
    diagnosed: false,
    treatmentType: 'medication',
  });

  useEffect(() => {
    if (status === "loading") return; 
    
    if (!session) {
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    const draft = profileService.loadDraft();
    if (draft && draft.role) {
      setSelectedRole(draft.role);
      if (draft.step) {
        setCurrentStep(draft.step);
      }
      if (draft.personalInfo) {
        setPersonalInfo(draft.personalInfo);
      }
      if (draft.medicalCondition) {
        setMedicalCondition(draft.medicalCondition);
      }
      if (draft.symptoms) {
        setSymptoms(draft.symptoms);
      }
      if (draft.diagnosisTreatment) {
        setDiagnosisTreatment(draft.diagnosisTreatment);
      }
      
      toast.info('Draft loaded!', {
        description: 'Your previously saved progress has been restored.',
        duration: 3000,
      });
    }
  }, []);

  useEffect(() => {
    if (selectedRole && (personalInfo.age || medicalCondition.conditionName)) {
      const draftData = {
        role: selectedRole,
        step: currentStep,
        personalInfo,
        medicalCondition,
        symptoms,
        diagnosisTreatment,
        lastSaved: new Date().toISOString()
      };
      profileService.saveDraft(draftData);
    }
  }, [selectedRole, personalInfo, medicalCondition, symptoms, diagnosisTreatment, currentStep]);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < defaultSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      toast.success('Step completed!', {
        description: `Moving to ${defaultSteps[currentStep + 1].name}`,
        duration: 2000,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      toast.info('Going back', {
        description: `Returned to ${defaultSteps[currentStep - 1].name}`,
        duration: 2000,
      });
    }
  };

  const handleSubmit = async () => {
    if (!session?.user || !selectedRole) return;

    setIsSubmitting(true);

    try {
      const profileData = {
        userId: session.user.id,
        role: selectedRole,
        personalInfo,
        medicalCondition,
        symptoms,
        diagnosisTreatment,
        isVerified: false,
        verificationMethod: 'self-declared',
      };

      console.log('Submitting profile data:', profileData);
      const result = await profileService.profileSetup(profileData);
      
      if (result.success) {
        profileService.clearDraft();
        
        toast.success('Profile created successfully! 🎉', {
          description: 'Your health profile has been saved and you can now connect with others.',
          duration: 5000,
        });
        router.push('/healthProfile/viewProfile');
      } else {
        toast.error('Failed to create profile', {
          description: result.message,
          duration: 5000,
        });
      }

    } catch (error) {
      console.error('Profile submission error:', error);
      toast.error('Something went wrong', {
        description: 'An unexpected error occurred. Please try again.',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-indigo-50 dark:from-slate-900 dark:via-background dark:to-indigo-950">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
            <span className="text-3xl">🏥</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Create Your Health Profile
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Share your health journey to connect with others and build a supportive community. 
            Your story can help others facing similar challenges.
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <RoleTabs selectedRole={selectedRole} onRoleChange={handleRoleChange} />
        </div>

        {selectedRole && (
          <>
            {/* Progress Indicator */}
            <ProgressIndicator currentStep={currentStep} />

            {/* Form Container */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
                {/* Step Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
                  <div className="flex items-center justify-between text-white">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-3">
                        <span className="text-3xl">{defaultSteps[currentStep].icon}</span>
                        {defaultSteps[currentStep].name}
                      </h2>
                      <p className="text-blue-100 mt-1">{defaultSteps[currentStep].description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{currentStep + 1}</div>
                      <div className="text-sm text-blue-200">of {defaultSteps.length}</div>
                    </div>
                  </div>
                </div>

                {/* Form Steps */}
                <div className="p-8">
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
                    <DiagnosisTreatmentStep
                      data={diagnosisTreatment}
                      onChange={setDiagnosisTreatment}
                      onNext={handleNext}
                      onBack={handleBack}
                    />
                  )}

                  {currentStep === 4 && (
                    <ReviewStep
                      personalInfo={personalInfo}
                      medicalCondition={medicalCondition}
                      symptoms={symptoms}
                      diagnosisTreatment={diagnosisTreatment}
                      role={selectedRole}
                      onBack={handleBack}
                      onSubmit={handleSubmit}
                      isSubmitting={isSubmitting}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="max-w-4xl mx-auto mt-8">
              <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Need Help?</h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      All information is optional and can be updated later. Focus on sharing what you're comfortable with. 
                      Your privacy and security are our top priorities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}