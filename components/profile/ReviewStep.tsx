import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PersonalInfoData } from './PersonalInfoStep';
import { MedicalConditionData } from './MedicalConditionStep';
import { SymptomsData } from './SymptomsStep';
import { DiagnosisData } from './DiagnosisStep';
import { TreatmentsData } from './TreatmentsStep';

interface ReviewStepProps {
  personalInfo: PersonalInfoData;
  medicalCondition: MedicalConditionData;
  symptoms: SymptomsData;
  diagnosis: DiagnosisData;
  treatments: TreatmentsData;
  role: 'seeker' | 'guide';
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function ReviewStep({
  personalInfo,
  medicalCondition,
  symptoms,
  diagnosis,
  treatments,
  role,
  onBack,
  onSubmit,
  isSubmitting,
}: ReviewStepProps) {
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
            <div><strong>Category:</strong> {medicalCondition.conditionCategory}</div>
            <div><strong>Condition:</strong> {medicalCondition.conditionName}</div>
            {medicalCondition.conditionDescription && (
              <div><strong>Description:</strong> {medicalCondition.conditionDescription}</div>
            )}
            <div><strong>Onset Date:</strong> {new Date(medicalCondition.onsetDate).toLocaleDateString()}</div>
            {medicalCondition.resolvedDate && (
              <div><strong>Resolved Date:</strong> {new Date(medicalCondition.resolvedDate).toLocaleDateString()}</div>
            )}
          </div>
        </div>

        {/* Symptoms */}
        {symptoms.symptoms.length > 0 && (
          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="text-lg font-semibold mb-3">Symptoms ({symptoms.symptoms.length})</h3>
            <div className="space-y-2">
              {symptoms.symptoms.map((symptom, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                  <div className="font-medium">{symptom.name}</div>
                  <div className="text-gray-600">
                    {symptom.severity} • {symptom.frequency} • {symptom.duration}
                    {symptom.notes && <span> • {symptom.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diagnosis */}
        <div className="border-l-4 border-purple-500 pl-4">
          <h3 className="text-lg font-semibold mb-3">Diagnosis</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Formally Diagnosed:</strong> {diagnosis.diagnosed ? 'Yes' : 'No'}</div>
            <div><strong>Certainty Level:</strong> {diagnosis.certainty}</div>
            {diagnosis.diagnosed && (
              <>
                {diagnosis.date && <div><strong>Diagnosis Date:</strong> {new Date(diagnosis.date).toLocaleDateString()}</div>}
                {diagnosis.diagnosedBy && <div><strong>Diagnosed By:</strong> {diagnosis.diagnosedBy}</div>}
                {diagnosis.conditionName && <div><strong>Condition Name:</strong> {diagnosis.conditionName}</div>}
              </>
            )}
            {diagnosis.notes && <div><strong>Notes:</strong> {diagnosis.notes}</div>}
          </div>
        </div>

        {/* Treatments */}
        {treatments.treatments.length > 0 && (
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="text-lg font-semibold mb-3">Treatments ({treatments.treatments.length})</h3>
            <div className="space-y-2">
              {treatments.treatments.map((treatment, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                  <div className="font-medium">{treatment.name}</div>
                  <div className="text-gray-600">
                    {treatment.type} • {treatment.duration} • {treatment.effectiveness}
                    {treatment.notes && <span> • {treatment.notes}</span>}
                  </div>
                </div>
              ))}
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