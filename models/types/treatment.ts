import { Schema,Document } from "mongoose";
import { TreatmentType,EffectivenessLevel } from "./profile.type";

export interface ITreatment extends Document {
    name:string;
    type:TreatmentType;
    duration:string;
    effectiveness:EffectivenessLevel;
    notes?:string;
}

export const TreatmentSchema:Schema = new Schema({
    name: { type:String, required:true},
    type: {
        type:String,
        required:true,
        enum:['medication','therapy','surgery','lifestyle','alternative']
    },
    duration: { type:String, required:true },
    effectiveness: {
        type:String,
        required:true,
        enum:['not effective','somewhat effective','effective','very effective']
},

    notes: { type:String }
},{ _id:false });