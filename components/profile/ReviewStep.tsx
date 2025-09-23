import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PersonalInfoData } from './PersonalInfoStep';
import { MedicalConditionData } from './MedicalConditionStep';
import { SymptomsData } from './SymptomsStep';
import { DiagnosisTreatmentData } from './DiagnosisTreatmentStep';

interface ReviewStepProps {
  personalInfo: PersonalInfoData;
  medicalCondition: MedicalConditionData;
  symptoms: SymptomsData;
  diagnosisTreatment: DiagnosisTreatmentData;
  role: 'seeker' | 'guide';
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function ReviewStep({
  personalInfo,
  medicalCondition,
  symptoms,
  diagnosisTreatment,
  role,
  onBack,
  onSubmit,
  isSubmitting,
}: ReviewStepProps) {

  const formatAmericanDate = (year?: number, month?: number | string) => {
    if (!year) return 'Not specified';
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    if (month && month !== '') {
      const monthIndex = typeof month === 'number' ? month - 1 : parseInt(month as string) - 1;
      const monthName = monthNames[monthIndex];
      return `${monthName} ${year}`;
    }
    
    return `${year}`;
  };
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Review Your Profile</h2>
        <p className="text-gray-600 mb-6">
          Please review all the information before submitting your {role} profile.
        </p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div><strong>Age:</strong> {personalInfo.age}</div>
            <div><strong>Gender:</strong> {personalInfo.gender}</div>
            {personalInfo.nationality && <div><strong>Nationality:</strong> {personalInfo.nationality}</div>}
            {personalInfo.location && <div><strong>Location:</strong> {personalInfo.location}</div>}
            {personalInfo.bloodType && <div><strong>Blood Type:</strong> {personalInfo.bloodType}</div>}
            {personalInfo.contactInfo?.contact_phone && (
              <div><strong>Phone:</strong> {personalInfo.contactInfo.contact_phone}</div>
            )}
            {personalInfo.contactInfo?.contact_email && (
              <div><strong>Email:</strong> {personalInfo.contactInfo.contact_email}</div>
            )}
          </div>
        </div>

        {/* Medical Condition */}
        <div className="border-l-4 border-green-500 pl-4">
          <h3 className="text-lg font-semibold mb-3">Medical Condition</h3>
          <div className="space-y-2 text-sm">
            {medicalCondition.conditionCategory && (
              <div><strong>Category:</strong> {medicalCondition.conditionCategory.charAt(0).toUpperCase() + medicalCondition.conditionCategory.slice(1)}</div>
            )}
            {medicalCondition.conditionName && (
              <div><strong>Condition:</strong> {medicalCondition.conditionName}</div>
            )}
            {medicalCondition.onsetYear && (
              <div><strong>Onset Date:</strong> {formatAmericanDate(medicalCondition.onsetYear, medicalCondition.onsetMonth)}</div>
            )}
            {medicalCondition.onresolvedYear && (
              <div><strong>Resolved Date:</strong> {formatAmericanDate(medicalCondition.onresolvedYear, medicalCondition.onresolvedMonth)}</div>
            )}
            {medicalCondition.conditionDescription && (
              <div><strong>Description:</strong> {medicalCondition.conditionDescription}</div>
            )}
          </div>
        </div>

        {/* Symptoms */}
        {(symptoms.name_of_symptoms || symptoms.severity || symptoms.frequency || symptoms.symptomDuration || symptoms.symptomNotes) && (
          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="text-lg font-semibold mb-3">Symptoms</h3>
            <div className="space-y-2 text-sm">
              {symptoms.name_of_symptoms && (
                <div><strong>Symptoms:</strong> {symptoms.name_of_symptoms}</div>
              )}
              {symptoms.severity && (
                <div><strong>Severity:</strong> {symptoms.severity.charAt(0).toUpperCase() + symptoms.severity.slice(1)}</div>
              )}
              {symptoms.frequency && (
                <div><strong>Frequency:</strong> {symptoms.frequency.charAt(0).toUpperCase() + symptoms.frequency.slice(1)}</div>
              )}
              {symptoms.symptomDuration && (
                <div><strong>Duration:</strong> {symptoms.symptomDuration}</div>
              )}
              {symptoms.symptomNotes && (
                <div><strong>Notes:</strong> {symptoms.symptomNotes}</div>
              )}
            </div>
          </div>
        )}

        {/* Diagnosis & Treatment */}
        {(diagnosisTreatment.diagnosed !== undefined || diagnosisTreatment.treatmentName) && (
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="text-lg font-semibold mb-3">Diagnosis & Treatment</h3>
            <div className="space-y-2 text-sm">
              {diagnosisTreatment.diagnosed !== undefined && (
                <div><strong>Formally Diagnosed:</strong> {diagnosisTreatment.diagnosed ? 'Yes' : 'No'}</div>
              )}
              {diagnosisTreatment.certainty && (
                <div><strong>Certainty Level:</strong> {diagnosisTreatment.certainty.charAt(0).toUpperCase() + diagnosisTreatment.certainty.slice(1)}</div>
              )}
              {diagnosisTreatment.diagnosedYear && (
                <div><strong>Diagnosed Date:</strong> {formatAmericanDate(diagnosisTreatment.diagnosedYear)}</div>
              )}
              {diagnosisTreatment.diagnosedBy && (
                <div><strong>Diagnosed By:</strong> {diagnosisTreatment.diagnosedBy}</div>
              )}
              {diagnosisTreatment.diagnosisNotes && (
                <div><strong>Diagnosis Notes:</strong> {diagnosisTreatment.diagnosisNotes}</div>
              )}
              
              {/* Treatment Information */}
              {diagnosisTreatment.treatmentName && (
                <>
                  <div className="border-t pt-2 mt-3">
                    <div className="font-medium text-purple-700 mb-2">Treatment Information</div>
                  </div>
                  <div><strong>Treatment Name:</strong> {diagnosisTreatment.treatmentName}</div>
                  {diagnosisTreatment.treatmentType && (
                    <div><strong>Treatment Type:</strong> {diagnosisTreatment.treatmentType.charAt(0).toUpperCase() + diagnosisTreatment.treatmentType.slice(1)}</div>
                  )}
                  {diagnosisTreatment.treatmentDuration && (
                    <div><strong>Duration:</strong> {diagnosisTreatment.treatmentDuration}</div>
                  )}
                  {diagnosisTreatment.treatmentEffectiveness && (
                    <div><strong>Effectiveness:</strong> {diagnosisTreatment.treatmentEffectiveness.charAt(0).toUpperCase() + diagnosisTreatment.treatmentEffectiveness.slice(1)}</div>
                  )}
                  {diagnosisTreatment.treatmentNotes && (
                    <div><strong>Treatment Notes:</strong> {diagnosisTreatment.treatmentNotes}</div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Important Note</h4>
        <p className="text-blue-800 text-sm">
          By submitting this profile, you confirm that the information provided is accurate to the best of your knowledge. 
          {role === 'guide' && ' As a guide, you agree to share your experience to help others with similar conditions.'}
          {role === 'seeker' && ' As a seeker, you agree to use this information responsibly for matching with relevant guides.'}
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Profile'}
        </Button>
      </div>
    </Card>
  );
}