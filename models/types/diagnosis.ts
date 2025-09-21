import { Schema, Document } from 'mongoose';
import { CertaintyLevel } from './profile.type';

export interface IDiagnosis extends Document {
  diagnosed: boolean;
  date?: Date;
  diagnosedBy?: string;
  conditionName?: string;
  certainty: CertaintyLevel;
  notes?: string;
}

export const DiagnosisSchema: Schema = new Schema({
  diagnosed: { type: Boolean, required: true, default: false },
  date: { type: Date },
  diagnosedBy: { type: String },
  conditionName: { type: String },
  certainty: { 
    type: String, 
    enum: ['suspected', 'probable', 'confirmed'],
    default: 'suspected'
  },
  notes: { type: String }
}, { _id: false });