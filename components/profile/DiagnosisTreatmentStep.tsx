import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CertaintyLevel, TreatmentType, EffectivenessLevel } from '@/models/types/profile.type';

export interface DiagnosisTreatmentData {
  diagnosed: boolean;
  diagnosedYear?: number;
  diagnosedBy?: string;
  certainty?: CertaintyLevel;
  diagnosisNotes?: string;
  treatmentName?: string;
  treatmentType: TreatmentType;
  treatmentDuration?: string;
  treatmentEffectiveness?: EffectivenessLevel;
  treatmentNotes?: string;
}

interface DiagnosisTreatmentStepProps {
  data: DiagnosisTreatmentData;
  onChange: (data: DiagnosisTreatmentData) => void;
  onNext: () => void;
  onBack?: () => void;
}

const certaintyOptions: CertaintyLevel[] = ['suspected', 'probable', 'confirmed'];
const treatmentTypes: TreatmentType[] = ['medication', 'therapy', 'surgery', 'lifestyle changes', 'alternative'];
const effectivenessOptions: EffectivenessLevel[] = ['not effective', 'somewhat effective', 'effective', 'very effective'];

export default function DiagnosisTreatmentStep({ data, onChange, onNext, onBack }: DiagnosisTreatmentStepProps) {
  const handleInputChange = (field: keyof DiagnosisTreatmentData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <main>
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Diagnosis & Treatment Information</h2>
        <p className="text-gray-600 mb-6">Please provide information about your diagnosis and any treatments you've tried.</p>
      </div>

      {/* Diagnosis Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Diagnosis Information</h3>
        
        <div>
          <label className="block text-sm font-medium mb-2">Have you been formally diagnosed?</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="diagnosed"
                checked={data.diagnosed === true}
                onChange={() => handleInputChange('diagnosed', true)}
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="diagnosed"
                checked={data.diagnosed === false}
                onChange={() => handleInputChange('diagnosed', false)}
                className="mr-2"
              />
              No
            </label>
          </div>
        </div>


          <div>
            <label className="block text-sm font-medium mb-2">Diagnosed By</label>
            <Input
              type="text"
              value={data.diagnosedBy || ''}
              onChange={(e) => handleInputChange('diagnosedBy', e.target.value)}
              placeholder="e.g., Dr. Smith, City Hospital"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Diagnosed By</label>
            <Input
              type="text"
              value={data.diagnosedYear || ''}
              onChange={(e) => handleInputChange('diagnosedYear', e.target.value)}
            />
          </div>




        <div>
          <label className="block text-sm font-medium mb-2">Certainty Level</label>
          <select
            value={data.certainty || ''}
            onChange={(e) => handleInputChange('certainty', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select certainty level</option>
            {certaintyOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Suspected: You think you might have it | Probable: Likely but not confirmed | Confirmed: Officially diagnosed
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Diagnosis Notes</label>
          <textarea
            value={data.diagnosisNotes || ''}
            onChange={(e) => handleInputChange('diagnosisNotes', e.target.value)}
            placeholder="Any additional information about your diagnosis..."
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Treatment Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Treatment Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Treatment Name</label>
            <Input
              type="text"
              value={data.treatmentName || ''}
              onChange={(e) => handleInputChange('treatmentName', e.target.value)}
              placeholder="e.g., Ibuprofen, Physical Therapy, Surgery"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Treatment Type</label>
            <select
              value={data.treatmentType || ''}
              onChange={(e) => handleInputChange('treatmentType', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select treatment type</option>
              {treatmentTypes.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Treatment Duration</label>
            <Input
              type="text"
              value={data.treatmentDuration || ''}
              onChange={(e) => handleInputChange('treatmentDuration', e.target.value)}
              placeholder="e.g., 2 weeks, ongoing, 6 months"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Treatment Effectiveness</label>
            <select
              value={data.treatmentEffectiveness || ''}
              onChange={(e) => handleInputChange('treatmentEffectiveness', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select effectiveness</option>
              {effectivenessOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Treatment Notes</label>
          <textarea
            value={data.treatmentNotes || ''}
            onChange={(e) => handleInputChange('treatmentNotes', e.target.value)}
            placeholder="Any additional details about your treatment..."
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        <Button
          onClick={onNext}
          className="ml-auto"
        >
          Next
        </Button>
      </div>
    </Card>
    </main>
  );
}