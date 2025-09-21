import { Document,Types } from "mongoose";

export type UserRole = 'seeker' | 'guide'; 
export type SeverityLevel = 'mild' | 'moderate' | 'severe';
export type FrequencyLevel = 'rarely' | 'sometimes' | 'often'|'constant';
export type TreatmentType = 'medication' | 'therapy' | 'surgery' | 'lifestyle changes' | 'alternative';
export type EffectivenessLevel = 'effective' | 'somewhat effective' | 'not effective' | 'very effective';
export type VerificationMethod = 'self-Declared' | 'Community-Validated' | 'medical_document';
export type CertaintyLevel = 'suspected' | 'probable' | 'confirmed';


export interface IUser{
    _id:Types.ObjectId;
    email:string;
    username:string;
}

export interface IHealthProfileBase{
    userId: Types.ObjectId;
    role:UserRole;

    //Personal information
    age?:number;
    Nationality?:string;
    Location?:string;
    gender?:'male' | 'female' | 'Prefer not to say' | 'other';
    bloodType?:'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
    contactInfo?:{
        phone?:string;
        UserEmail?:string;
    }

    //Health Condition Information
    conditionCategory:string;
    conditionName:string;
    conditionDescription?:string;

    //Timeline
    onsetDate:Date;
    resolvedDate?:Date;

    //Verification
    isVerified:boolean;
    verificationMethod?:VerificationMethod;
    verificationDate?:Date;

    createdAt:Date;
    updatedAt:Date;

}

export interface IHealthProfile extends IHealthProfileBase, Document {}