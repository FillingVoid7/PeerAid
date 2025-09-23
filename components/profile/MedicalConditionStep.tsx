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

  const formatOnsetDate = () => {
    if (!data.onsetYear) return '';
    
    if (data.onsetMonth && data.onsetMonth !== '') {
      const monthIndex = typeof data.onsetMonth === 'number' ? data.onsetMonth - 1 : parseInt(data.onsetMonth as string) - 1;
      const monthName = monthNames[monthIndex];
      return `${monthName} ${data.onsetYear}`;
    }
    
    return `${data.onsetYear}`;
  };

  const formatResolvedDate = () => {
    if (!data.onresolvedYear) return '';
    
    if (data.onresolvedMonth && data.onresolvedMonth !== '') {
      const monthIndex = typeof data.onresolvedMonth === 'number' ? data.onresolvedMonth - 1 : parseInt(data.onresolvedMonth as string) - 1;
      const monthName = monthNames[monthIndex];
      return `${monthName} ${data.onresolvedYear}`;
    }
    
    return `${data.onresolvedYear}`;
  };

  return (
    <main>
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Medical Condition</h2>
        <p className="text-gray-600 mb-6">Please provide details about your health condition.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Condition Category</label>
          <select
            value={data.conditionCategory || ''}
            onChange={(e) => handleInputChange('conditionCategory', e.target.value)}
            className="w-full p-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
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
          <label className="block text-sm font-medium mb-2">Condition Name</label>
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
            className="w-full p-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="">Select month (optional)</option>
            {monthNames.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {(data.onsetYear || data.onsetMonth) && (
          <div>
            <label className="block text-sm font-medium mb-2">Formatted Onset Date</label>
            <div className="w-full p-2 border border-muted rounded-md bg-muted text-muted-foreground">
              {formatOnsetDate() || 'Please enter a year'}
            </div>
          </div>
        )}

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
            className="w-full p-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="">Select month (optional)</option>
            {monthNames.map((month, index) => (
              <option key={month} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {(data.onresolvedYear || data.onresolvedMonth) && (
          <div>
            <label className="block text-sm font-medium mb-2">Formatted Resolved Date</label>
            <div className="w-full p-2 border border-muted rounded-md bg-muted text-muted-foreground">
              {formatResolvedDate() || 'Please enter a year'}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Condition Description</label>
          <textarea
            value={data.conditionDescription || ''}
            onChange={(e) => handleInputChange('conditionDescription', e.target.value)}
            placeholder="Describe your condition in detail..."
            rows={4}
            className="w-full p-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
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