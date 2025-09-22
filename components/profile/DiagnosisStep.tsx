import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CertaintyLevel } from '@/models/types/profile.type';

export interface DiagnosisData {
  diagnosed: boolean;
  date?: string;
  diagnosedBy?: string;
  conditionName?: string;
  certainty: CertaintyLevel;
  notes?: string;
}

interface DiagnosisStepProps {
  data: DiagnosisData;
  onChange: (data: DiagnosisData) => void;
  onNext: () => void;
  onBack: () => void;
  role: 'seeker' | 'guide';
}

const certaintyOptions: CertaintyLevel[] = ['suspected', 'probable', 'confirmed'];

export default function DiagnosisStep({ data, onChange, onNext, onBack, role }: DiagnosisStepProps) {
  const handleInputChange = (field: keyof DiagnosisData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const isRequired = role === 'seeker';
  const isValid = !isRequired || (data.diagnosed !== undefined && data.certainty);

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Diagnosis Information</h2>
        <p className="text-gray-600 mb-6">
          {role === 'seeker' 
            ? 'Please provide information about your diagnosis.'
            : 'Share your diagnosis information to help others with similar conditions.'
          }
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Have you been formally diagnosed? {isRequired && <span className="text-red-500">*</span>}
          </label>
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

        {data.diagnosed && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Diagnosis Date</label>
                <Input
                  type="date"
                  value={data.date || ''}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
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
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Diagnosed Condition Name</label>
              <Input
                type="text"
                value={data.conditionName || ''}
                onChange={(e) => handleInputChange('conditionName', e.target.value)}
                placeholder="Official medical name of the condition"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">
            Certainty Level {isRequired && <span className="text-red-500">*</span>}
          </label>
          <select
            value={data.certainty}
            onChange={(e) => handleInputChange('certainty', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={isRequired}
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
          <label className="block text-sm font-medium mb-2">Additional Notes</label>
          <textarea
            value={data.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any additional information about your diagnosis..."
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!isValid}
        >
          Next
        </Button>
      </div>
    </Card>
  );
}