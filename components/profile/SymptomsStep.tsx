import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FrequencyLevel, SeverityLevel } from '@/models/types/profile.type';

export interface SymptomsData {
  name_of_symptoms: string;
  severity: SeverityLevel;
  frequency?: FrequencyLevel;
  symptomDuration?: string;
  symptomNotes?: string;
}

interface SymptomsStepProps {
  data: SymptomsData;
  onChange: (data: SymptomsData) => void;
  onNext: () => void;
  onBack?: () => void;
}

const severityOptions: SeverityLevel[] = ['mild', 'moderate', 'severe'];
const frequencyOptions: FrequencyLevel[] = ['rarely', 'sometimes', 'often', 'constant'];

export default function SymptomsStep({ data, onChange, onNext, onBack }: SymptomsStepProps) {
  const handleInputChange = (field: keyof SymptomsData, value: any) => {
    onChange({ ...data, [field]: value });
  };


  return (
    <main>
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Symptoms</h2>
        <p className="text-gray-600 mb-6">Please provide information about your symptoms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2"> Symptoms </label>
          <Input
            type="text"
            value={data.name_of_symptoms || ''}
            onChange={(e) => handleInputChange('name_of_symptoms', e.target.value)}
            placeholder="e.g., Headache, Fatigue, Nausea"
          />
        </div>


        <div>
          <label className="block text-sm font-medium mb-2">Severity</label>
          <select
            value={data.severity || ''}
            onChange={(e) => handleInputChange('severity', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select severity</option>
            {severityOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Frequency</label>
          <select
            value={data.frequency || ''}
            onChange={(e) => handleInputChange('frequency', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select frequency</option>
            {frequencyOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Symptom Duration</label>
          <Input
            type="text"
            value={data.symptomDuration || ''}
            onChange={(e) => handleInputChange('symptomDuration', e.target.value)}
            placeholder="e.g., 2 weeks, 3 months, ongoing"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Symptom Notes</label>
          <textarea
            value={data.symptomNotes || ''}
            onChange={(e) => handleInputChange('symptomNotes', e.target.value)}
            placeholder="Any additional details about your symptoms..."
            rows={4}
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