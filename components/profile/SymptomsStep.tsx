import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FrequencyLevel, SeverityLevel } from '@/models/types/profile.type';

export interface SymptomData {
  name: string;
  severity: SeverityLevel;
  frequency: FrequencyLevel;
  duration: string;
  notes?: string;
}

export interface SymptomsData {
  symptoms: SymptomData[];
}

interface SymptomsStepProps {
  data: SymptomsData;
  onChange: (data: SymptomsData) => void;
  onNext: () => void;
  onBack: () => void;
}

const severityOptions: SeverityLevel[] = ['mild', 'moderate', 'severe'];
const frequencyOptions: FrequencyLevel[] = ['rarely', 'sometimes', 'often', 'constant'];

export default function SymptomsStep({ data, onChange, onNext, onBack }: SymptomsStepProps) {
  const [newSymptom, setNewSymptom] = useState<Partial<SymptomData>>({
    name: '',
    severity: undefined,
    frequency: undefined,
    duration: '',
    notes: '',
  });

  const addSymptom = () => {
    if (newSymptom.name && newSymptom.severity && newSymptom.frequency && newSymptom.duration) {
      const symptomToAdd: SymptomData = {
        name: newSymptom.name,
        severity: newSymptom.severity,
        frequency: newSymptom.frequency,
        duration: newSymptom.duration,
        notes: newSymptom.notes || '',
      };
      
      onChange({
        symptoms: [...data.symptoms, symptomToAdd],
      });

      // Reset form
      setNewSymptom({
        name: '',
        severity: undefined,
        frequency: undefined,
        duration: '',
        notes: '',
      });
    }
  };

  const removeSymptom = (index: number) => {
    const updatedSymptoms = data.symptoms.filter((_, i) => i !== index);
    onChange({ symptoms: updatedSymptoms });
  };

  const updateSymptom = (index: number, field: keyof SymptomData, value: string) => {
    const updatedSymptoms = [...data.symptoms];
    updatedSymptoms[index] = { ...updatedSymptoms[index], [field]: value };
    onChange({ symptoms: updatedSymptoms });
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Symptoms</h2>
        <p className="text-gray-600 mb-6">Add the symptoms you're experiencing or have experienced.</p>
      </div>

      {/* Existing Symptoms */}
      {data.symptoms.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Symptoms</h3>
          {data.symptoms.map((symptom, index) => (
            <div key={index} className="border p-4 rounded-md bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{symptom.name}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeSymptom(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <span><strong>Severity:</strong> {symptom.severity}</span>
                <span><strong>Frequency:</strong> {symptom.frequency}</span>
                <span><strong>Duration:</strong> {symptom.duration}</span>
              </div>
              {symptom.notes && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Notes:</strong> {symptom.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New Symptom */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Add New Symptom</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Symptom Name</label>
            <Input
              type="text"
              value={newSymptom.name}
              onChange={(e) => setNewSymptom({ ...newSymptom, name: e.target.value })}
              placeholder="e.g., Headache, Fatigue, Nausea"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Severity</label>
              <select
                value={newSymptom.severity || ''}
                onChange={(e) => setNewSymptom({ ...newSymptom, severity: e.target.value as SeverityLevel })}
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
                value={newSymptom.frequency || ''}
                onChange={(e) => setNewSymptom({ ...newSymptom, frequency: e.target.value as FrequencyLevel })}
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
              <label className="block text-sm font-medium mb-2">Duration</label>
              <Input
                type="text"
                value={newSymptom.duration || ''}
                onChange={(e) => setNewSymptom({ ...newSymptom, duration: e.target.value })}
                placeholder="e.g., 2 weeks, ongoing"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Additional Notes</label>
            <textarea
              value={newSymptom.notes}
              onChange={(e) => setNewSymptom({ ...newSymptom, notes: e.target.value })}
              placeholder="Any additional details about this symptom..."
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <Button
            onClick={addSymptom}
            disabled={!newSymptom.name || !newSymptom.severity || !newSymptom.frequency || !newSymptom.duration}
            className="w-full md:w-auto"
          >
            Add Symptom
          </Button>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>
          Next
        </Button>
      </div>
    </Card>
  );
}