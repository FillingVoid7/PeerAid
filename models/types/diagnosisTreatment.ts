import { Schema, Document } from 'mongoose';
import { CertaintyLevel, TreatmentType, EffectivenessLevel } from './profile.type';

// Diagnosis interface
export interface IDiagnosis extends Document {
  diagnosed: boolean;
  diagnosedYear?: number; 
  diagnosedBy?: string;
  certainty?: CertaintyLevel;
  diagnosisNotes?: string;
}

// Treatment interface
export interface ITreatment extends Document {
  treatmentName?: string;
  treatmentType?: TreatmentType;
  treatmentDuration?: string;
  treatmentEffectiveness?: EffectivenessLevel;
  treatmentNotes?: string;
}

export interface IDiagnosisTreatment extends Document {
  diagnosis: IDiagnosis;
  treatments: ITreatment[];
}

// Diagnosis schema
export const DiagnosisSchema: Schema = new Schema({
  diagnosed: { type: Boolean, required: true, default: false },
  diagnoseYear: { type: Number },
  diagnosedBy: { type: String },
  certainty: { 
    type: String, 
    enum: ['suspected', 'probable', 'confirmed'],
    default: 'suspected'
  },
  diagnosisNotes: { type: String }
}, { _id: false });

// Treatment schema
export const TreatmentSchema: Schema = new Schema({
  treatmentName: { type: String},
  treatmentType: {
    type: String,
    enum: ['medication', 'therapy', 'surgery', 'lifestyle', 'alternative']
  },
  treatmentDuration: { type: String },
  treatmentEffectiveness: {
    type: String,
    enum: ['not effective', 'somewhat effective', 'effective', 'very effective']
  },
  treatmentNotes: { type: String }
}, { _id: false });

// Combined schema
export const DiagnosisTreatmentSchema: Schema = new Schema({
  diagnosis: { type: DiagnosisSchema, required: true },
  treatments: [TreatmentSchema]
}, { _id: false });