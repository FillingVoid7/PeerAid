import { NextRequest,NextResponse } from "next/server";
import HealthProfile from "@/models/healthProfile";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req:NextRequest){
    try{
    await connectDB();
    const body = await req.json();
    
    const userExists = await User.findById(body.userId);
    console.log('User exists:', userExists);
    if(!userExists){
        return NextResponse.json(
            { success: false, message: 'User does not exist' },
            { status: 400 }
        );
    }

    const existingProfile = await HealthProfile.findOne({ userId: body.userId });
    console.log('Existing profile:', existingProfile);
    if(existingProfile){
        return NextResponse.json(
            { success: false, message: 'Profile already exists for this user' },
            { status: 400 }
        );
    }

    const flattenedData = {
        userId: body.userId,
        role: body.role,
        
        // Personal Information
        age: body.personalInfo?.age,
        gender: body.personalInfo?.gender,
        nationality: body.personalInfo?.nationality,
        location: body.personalInfo?.location,
        bloodType: body.personalInfo?.bloodType,
        contactInfo: {
            contact_phone: body.personalInfo?.contactInfo?.contact_phone,
            contact_email: body.personalInfo?.contactInfo?.contact_email,
        },
        
        // Health Condition Information
        conditionCategory: body.medicalCondition?.conditionCategory,
        conditionName: body.medicalCondition?.conditionName,
        conditionDescription: body.medicalCondition?.conditionDescription,
        onsetYear: body.medicalCondition?.onsetYear,
        onsetMonth: body.medicalCondition?.onsetMonth,
        resolvedYear: body.medicalCondition?.onresolvedYear,
        resolvedMonth: body.medicalCondition?.onresolvedMonth,
        
        // Symptoms
        symptoms: body.symptoms ? [{
            name_of_symptoms: body.symptoms.name_of_symptoms,
            severity: body.symptoms.severity,
            frequency: body.symptoms.frequency,
            symptomDuration: body.symptoms.symptomDuration,
            symptomNotes: body.symptoms.symptomNotes,
        }] : [],
        
        // Diagnosis Information
        diagnosis: {
            diagnosed: body.diagnosisTreatment?.diagnosed || false,
            diagnosedYear: body.diagnosisTreatment?.diagnosedYear,
            diagnosedBy: body.diagnosisTreatment?.diagnosedBy,
            certainty: body.diagnosisTreatment?.certainty || 'suspected',
            diagnosisNotes: body.diagnosisTreatment?.diagnosisNotes,
        },
        
        // Treatments
        treatments: body.diagnosisTreatment?.treatmentName ? [{
            treatmentName: body.diagnosisTreatment.treatmentName,
            treatmentType: body.diagnosisTreatment.treatmentType || 'medication',
            treatmentDuration: body.diagnosisTreatment.treatmentDuration,
            treatmentEffectiveness: body.diagnosisTreatment.treatmentEffectiveness,
            treatmentNotes: body.diagnosisTreatment.treatmentNotes,
        }] : [],
        
        // Verification
        isVerified: body.isVerified || false,
        verificationMethod: body.verificationMethod || 'self-declared',
    };

    console.log('Flattened data:', flattenedData);
    
    const requiredFields = ['age', 'gender', 'bloodType'];
    const missingFields = requiredFields.filter(field => !flattenedData[field as keyof typeof flattenedData]);
    
    if (missingFields.length > 0) {
        console.log('Missing required fields:', missingFields);
        return NextResponse.json(
            { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
            { status: 400 }
        );
    }
    
    const newProfile = new HealthProfile(flattenedData);
    const savedNewProfile = await newProfile.save();

    return NextResponse.json(
        { success: true, message: 'Profile created successfully', profile: savedNewProfile },
        { status: 201 }
    );


} catch (error) {
    console.error('Error creating profile:', error);
    
    if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
        { 
            success: false, 
            message: 'Error creating profile',
            error: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
    );
}

}