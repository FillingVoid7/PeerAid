import { Schema, Model, model } from "mongoose";
import {
  IHealthProfile,
} from "./types/profile.type";
import { SymptomSchema, ISymptom } from "./types/symptom";
import { TreatmentSchema, ITreatment } from "./types/treatment";
import { DiagnosisSchema, IDiagnosis } from "./types/diagnosis";

const HealthProfileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["seeker", "guide"],
      index: true,
    },

    // Personal Information
    age: { type: Number, min: 13, max: 120, required: true },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "prefer not to say", "other"],
    },
    nationality: { type: String },
    location: { type: String },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    contactInfo: {
      contact_phone: { type: String },
      contact_email: { type: String },
    },

    // Health Condition Information
    conditionCategory: {
      type: String,
      required: true,
      enum: [
        "skin",
        "internal",
        "mental",
        "reproductive",
        "chronic",
        "infectious",
        "genetic",
        "other",
      ],
      index: true,
    },
    conditionName: { type: String, required: true, index: true },
    conditionDescription: { type: String },

    // Symptoms
    symptoms: [SymptomSchema],

    // Diagnosis Information
    diagnosis: { type: DiagnosisSchema, required: true },

    // Treatments
    treatments: [TreatmentSchema],

    // Timeline
    onsetDate: { type: Date, required: true },
    resolvedDate: { type: Date },

    // Verification
    isVerified: { type: Boolean, default: false, index: true },
    verificationMethod: {
      type: String,
      enum: ["self-Declared", "Community-Validated", "medical_document"],
    },
    verificationDate: { type: Date },

    // Stats for analysis
    helpfulCount: { type: Number, default: 0 },
    matchCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const HealthProfile: Model<IHealthProfile> = model<IHealthProfile>(
  "HealthProfile",
  HealthProfileSchema
);

export default HealthProfile;
