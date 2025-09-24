import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface PersonalInfoData {
  age: number | '';
  gender: 'male' | 'female' | 'prefer not to say' | 'other' | '';
  nationality?: string;
  location?: string;
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '';
  contactInfo: {
    contact_phone?: string;
    contact_email?: string;
  };
}

interface PersonalInfoStepProps {
  data: PersonalInfoData;
  onChange: (data: PersonalInfoData) => void;
  onNext: () => void;
  onBack?: () => void;
}

export default function PersonalInfoStep({ data, onChange, onNext, onBack }: PersonalInfoStepProps) {
  const handleInputChange = (field: keyof PersonalInfoData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleContactChange = (field: 'contact_phone' | 'contact_email', value: string) => {
    onChange({
      ...data,
      contactInfo: {
        ...data.contactInfo,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Personal Information</h2>
        <p className="text-muted-foreground text-lg">Please provide your basic personal details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Age
          </label>
          <Input
            type="number"
            min="13"
            max="120"
            value={data.age}
            onChange={(e) => handleInputChange('age', parseInt(e.target.value) || '')}
            placeholder="Enter your age"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Gender 
          </label>
          <select
            value={data.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full p-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="prefer not to say">Prefer not to say</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nationality (Optional)</label>
          <Input
            type="text"
            value={data.nationality || ''}
            onChange={(e) => handleInputChange('nationality', e.target.value)}
            placeholder="Enter your nationality"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location (Optional)</label>
          <Input
            type="text"
            value={data.location || ''}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Enter your location"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Blood Type</label>
          <select
            value={data.bloodType || ''}
            onChange={(e) => handleInputChange('bloodType', e.target.value)}
            className="w-full p-2 border border-input bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-transparent text-foreground"
          >
            <option value="">Select blood type</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Contact Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number (Optional)</label>
            <Input
              type="tel"
              value={data.contactInfo?.contact_phone || ''}
              onChange={(e) => handleContactChange('contact_phone', e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email (Optional)</label>
            <Input
              type="email"
              value={data.contactInfo?.contact_email || ''}
              onChange={(e) => handleContactChange('contact_email', e.target.value)}
              placeholder="Enter your email"
            />
          </div>
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