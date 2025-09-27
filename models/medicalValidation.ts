import { Schema, Model, model, Document, Types } from "mongoose";

export interface IMedicalValidation extends Document {
    document_metadata: {
        userId: Types.ObjectId;
        DOB?: Date;
        healthcareProvider?: string;
        dateOfIssue: Date;
        validTill?: Date;
        documentType: "prescription" | "lab_report" | "imaging_report" | "discharge_summary" | "vaccination_record" | "insurance_document" | "other";
    };
    
    uploadedFile: {
        publicId: string;  // for deletion/updation
        url: string;
        type: "image" | "video" | "pdf";
        fileName?: string;
        fileSize?: number;
        format?: string;
    };

    verificationInfo: {
        patientName: string;
        referenceID?: string;
        isVerified: boolean;
        verificationStatus: "pending" | "verified" | "rejected";
        verifiedAt?: Date;
    };

    isConsentChecked: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}


const MedicalValidationSchema = new Schema<IMedicalValidation>({
    document_metadata: {
        userId: {
            type: Types.ObjectId,
            required: true,
            ref: 'User'
        },
        DOB: {
            type: Date,
            required: false
        },
        healthcareProvider: {
            type: String,
            required: false
        },
        dateOfIssue: {
            type: Date,
            required: true
        },
        validTill: {
            type: Date,
            required: false
        },
        documentType: {
            type: String,
            enum: ["prescription", "lab_report", "imaging_report", "discharge_summary", "vaccination_record", "insurance_document", "other"],
            required: true
        }
    },

    uploadedFile: {
        publicId: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ["image", "video", "pdf"],
            required: true
        },
    },

    verificationInfo: {
        patientName: {
            type: String,
            required: true
        },
        referenceID: {
            type: String,
            required: false
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending"
        },
        verifiedAt: {
            type: Date,
            required: false
        },
    },

    isConsentChecked: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true,
    collection: 'medical_validations'
});


const MedicalValidation: Model<IMedicalValidation> = model<IMedicalValidation>('MedicalValidation', MedicalValidationSchema);

export default MedicalValidation;

