import { Schema, Document } from 'mongoose'; 
import { FrequencyLevel, SeverityLevel } from './profile.type';

export interface ISymptom extends Document {
  name_of_symptoms: string;
  severity: SeverityLevel;
  frequency?: FrequencyLevel;
  symptomDuration?: string;
  symptomNotes?: string;
}

export const SymptomSchema: Schema = new Schema({
  name_of_symptoms: { type: String, required: true },
  severity: { 
    type: String, 
    required: true, 
    enum: ['mild', 'moderate', 'severe'] 
  },
  frequency: { 
    type: String, 
    required: true, 
    enum: ['rarely', 'sometimes', 'often', 'constant'] 
  },
  symptomDuration: { type: String },
  symptomNotes: { type: String }
}, { _id: false });