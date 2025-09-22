import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TreatmentType, EffectivenessLevel } from '@/models/types/profile.type';

export interface TreatmentData {
  name: string;
  type: TreatmentType;
  duration: string;
  effectiveness: EffectivenessLevel;
  notes?: string;
}

export interface TreatmentsData {
  treatments: TreatmentData[];
}

interface TreatmentsStepProps {
  data: TreatmentsData;
  onChange: (data: TreatmentsData) => void;
  onNext: () => void;
  onBack: () => void;
  role: 'seeker' | 'guide';
}

const treatmentTypes: TreatmentType[] = ['medication', 'therapy', 'surgery', 'lifestyle changes', 'alternative'];
const effectivenessOptions: EffectivenessLevel[] = ['not effective', 'somewhat effective', 'effective', 'very effective'];

export default function TreatmentsStep({ data, onChange, onNext, onBack, role }: TreatmentsStepProps) {
  const [newTreatment, setNewTreatment] = useState<Partial<TreatmentData>>({
    name: '',
    type: undefined,
    duration: '',
    effectiveness: undefined,
    notes: '',
  });

  const addTreatment = () => {
    if (newTreatment.name && newTreatment.type && newTreatment.duration && newTreatment.effectiveness) {
      const treatmentToAdd: TreatmentData = {
        name: newTreatment.name,
        type: newTreatment.type,
        duration: newTreatment.duration,
        effectiveness: newTreatment.effectiveness,
        notes: newTreatment.notes || '',
      };
      
      onChange({
        treatments: [...data.treatments, treatmentToAdd],
      });

      // Reset form
      setNewTreatment({
        name: '',
        type: undefined,
        duration: '',
        effectiveness: undefined,
        notes: '',
      });
    }
  };

  const removeTreatment = (index: number) => {
    const updatedTreatments = data.treatments.filter((_, i) => i !== index);
    onChange({ treatments: updatedTreatments });
  };

  const isRequired = role === 'guide';
  const isValid = !isRequired || data.treatments.length > 0;

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Treatments</h2>
        <p className="text-gray-600 mb-6">
          {role === 'guide' 
            ? 'Share the treatments you\'ve tried or are currently using. At least one treatment is required for guides.'
            : 'Add any treatments you\'ve tried or are currently using.'
          }
        </p>
      </div>

      {/* Existing Treatments */}
      {data.treatments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Treatments</h3>
          {data.treatments.map((treatment, index) => (
            <div key={index} className="border p-4 rounded-md bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{treatment.name}</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeTreatment(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <span><strong>Type:</strong> {treatment.type}</span>
                <span><strong>Duration:</strong> {treatment.duration}</span>
                <span><strong>Effectiveness:</strong> {treatment.effectiveness}</span>
              </div>
              {treatment.notes && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Notes:</strong> {treatment.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add New Treatment */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Add New Treatment</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Treatment Name</label>
            <Input
              type="text"
              value={newTreatment.name || ''}
              onChange={(e) => setNewTreatment({ ...newTreatment, name: e.target.value })}
              placeholder="e.g., Ibuprofen, Physical Therapy, Surgery"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Treatment Type</label>
              <select
                value={newTreatment.type || ''}
                onChange={(e) => setNewTreatment({ ...newTreatment, type: e.target.value as TreatmentType })}
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
              <label className="block text-sm font-medium mb-2">Duration</label>
              <Input
                type="text"
                value={newTreatment.duration || ''}
                onChange={(e) => setNewTreatment({ ...newTreatment, duration: e.target.value })}
                placeholder="e.g., 2 weeks, ongoing, 6 months"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Effectiveness</label>
            <select
              value={newTreatment.effectiveness || ''}
              onChange={(e) => setNewTreatment({ ...newTreatment, effectiveness: e.target.value as EffectivenessLevel })}
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

          <div>
            <label className="block text-sm font-medium mb-2">Additional Notes</label>
            <textarea
              value={newTreatment.notes || ''}
              onChange={(e) => setNewTreatment({ ...newTreatment, notes: e.target.value })}
              placeholder="Any additional details about this treatment..."
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <Button
            onClick={addTreatment}
            disabled={!newTreatment.name || !newTreatment.type || !newTreatment.duration || !newTreatment.effectiveness}
            className="w-full md:w-auto"
          >
            Add Treatment
          </Button>
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