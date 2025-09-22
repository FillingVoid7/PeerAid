import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface MedicalConditionData {
  conditionCategory: string;
  conditionName: string;
  conditionDescription?: string;
  onsetDate: string;
  resolvedDate?: string;
}

interface MedicalConditionStepProps {
  data: MedicalConditionData;
  onChange: (data: MedicalConditionData) => void;
  onNext: () => void;
  onBack: () => void;
}

const conditionCategories = [
  'skin',
  'internal',
  'mental',
  'reproductive',
  'chronic',
  'infectious',
  'genetic',
  'other',
];

export default function MedicalConditionStep({ data, onChange, onNext, onBack }: MedicalConditionStepProps) {
  const handleInputChange = (field: keyof MedicalConditionData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const isValid = data.conditionCategory && data.conditionName && data.onsetDate;

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Medical Condition</h2>
        <p className="text-gray-600 mb-6">Please provide details about your health condition.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Condition Category <span className="text-red-500">*</span>
          </label>
          <select
            value={data.conditionCategory}
            onChange={(e) => handleInputChange('conditionCategory', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a category</option>
            {conditionCategories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Condition Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={data.conditionName}
            onChange={(e) => handleInputChange('conditionName', e.target.value)}
            placeholder="Enter the name of your condition"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Condition Description</label>
          <textarea
            value={data.conditionDescription || ''}
            onChange={(e) => handleInputChange('conditionDescription', e.target.value)}
            placeholder="Describe your condition in detail..."
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Onset Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={data.onsetDate}
              onChange={(e) => handleInputChange('onsetDate', e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]} // Can't be in the future
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Resolved Date (if applicable)</label>
            <Input
              type="date"
              value={data.resolvedDate || ''}
              onChange={(e) => handleInputChange('resolvedDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              min={data.onsetDate} 
            />
          </div>
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