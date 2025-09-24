import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface MedicalConditionData {
  conditionCategory: string;
  conditionName?: string;
  conditionDescription?: string;
  onsetYear: number;
  onsetMonth?: number | string;
  onresolvedYear?: number;
  onresolvedMonth?: number | string;
}

interface MedicalConditionStepProps {
  data: MedicalConditionData;
  onChange: (data: MedicalConditionData) => void;
  onNext: () => void;
  onBack?: () => void;
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

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MedicalConditionStep({ data, onChange, onNext, onBack }: MedicalConditionStepProps) {
  const handleInputChange = (field: keyof MedicalConditionData, value: any) => {
    onChange({ ...data, [field]: value });
  };


  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Medical Condition</h2>
        <p className="text-muted-foreground text-lg">Please provide details about your health condition.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Condition Category</label>
          <select
            value={data.conditionCategory || ''}
            onChange={(e) => handleInputChange('conditionCategory', e.target.value)}
            className="w-full p-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
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
          <label className="block text-sm font-medium mb-2">Condition Name (Optional)</label>
          <Input
            type="text"
            value={data.conditionName || ''}
            onChange={(e) => handleInputChange('conditionName', e.target.value)}
            placeholder="Enter the name of your condition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Onset Year</label>
          <Input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={data.onsetYear || ''}
            onChange={(e) => handleInputChange('onsetYear', parseInt(e.target.value) || '')}
            placeholder="e.g., 2023"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Onset Month (Optional)</label>
          <select
            value={data.onsetMonth || ''}
            onChange={(e) => handleInputChange('onsetMonth', e.target.value ? parseInt(e.target.value) : '')}
            className="w-full p-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
          >
            <option value="">Select month</option>
            {monthNames.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>


        <div>
          <label className="block text-sm font-medium mb-2">Resolved Year</label>
          <Input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={data.onresolvedYear || ''}
            onChange={(e) => handleInputChange('onresolvedYear', parseInt(e.target.value) || '')}
            placeholder="e.g., 2024"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Resolved Month (Optional)</label>
          <select
            value={data.onresolvedMonth || ''}
            onChange={(e) => handleInputChange('onresolvedMonth', e.target.value ? parseInt(e.target.value) : '')}
            className="w-full p-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
          >
            <option value="">Select month</option>
            {monthNames.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>

      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Condition Description (Optional)</label>
          <textarea
            value={data.conditionDescription || ''}
            onChange={(e) => handleInputChange('conditionDescription', e.target.value)}
            placeholder="Describe your condition in detail..."
            rows={4}
            className="w-full p-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          />
        </div>
      </div>

      <div className="flex justify-between pt-8">
        {onBack && (
          <Button variant="outline" onClick={onBack} className="px-8 py-3 text-lg">
            Back
          </Button>
        )}
        <Button
          onClick={onNext}
          className="ml-auto px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          Next
        </Button>
      </div>
    </div>
  );
}