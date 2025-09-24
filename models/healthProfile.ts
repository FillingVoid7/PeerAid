import { Schema, Model, model, models } from "mongoose";
import {
  IHealthProfile,
} from "./types/profile.type";
import { SymptomSchema, ISymptom } from "./types/symptom";
import { TreatmentSchema, DiagnosisSchema } from "./types/diagnosisTreatment";

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
    age: { type: Number, min: 13, max: 120 ,required:true},
    gender: {
      type: String,
      enum: ["male", "female", "prefer not to say", "other"],
      required:true
    },
    nationality: { type: String },
    location: { type: String },
    bloodType: {
      type: String,
      required:true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    contactInfo: {
      contact_phone: { type: String },
      contact_email: { type: String },
    },

    // Health Condition Information
    conditionCategory: {
      type: String,
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
    conditionName: { type: String,  index: true },
    conditionDescription: { type: String },
    onsetYear: { type: Number },
    onsetMonth: { type: Number },
    resolvedYear: { type: Number },
    resolvedMonth: { type: Number },

    // Symptoms
    symptoms: [SymptomSchema],

    // Diagnosis Information
    diagnosis: { type: DiagnosisSchema },

    // Treatments
    treatments: [TreatmentSchema],

    // Verification
    isVerified: { type: Boolean, default: false, index: true },
    verificationMethod: {
      type: String,
      enum: ["self-declared", "community-validated", "medical_document"],
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

const HealthProfile: Model<IHealthProfile> = models.HealthProfile || model<IHealthProfile>(
  "HealthProfile",
  HealthProfileSchema
);

export default HealthProfile;
