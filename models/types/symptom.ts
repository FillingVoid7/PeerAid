import { Schema, Document } from 'mongoose'; 
import { FrequencyLevel, SeverityLevel } from './profile.type';

export interface ISymptom extends Document {
  username: string;
  severity: SeverityLevel;
  frequency: FrequencyLevel;
  duration: string;
  notes?: string;
}

export const SymptomSchema: Schema = new Schema({
  name: { type: String, required: true },
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
  duration: { type: String, required: true },
  notes: { type: String }
}, { _id: false });