import {NextRequest, NextResponse} from "next/server";
import MedicalValidation from "@/models/medicalValidation";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req:NextRequest){
    try{
    await connectDB();
    const body = await req.json();
    const { userId, document_metadata, uploadedFile, verificationInfo, isConsentChecked } = body;

    if (!userId || !document_metadata || !uploadedFile || !verificationInfo) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userExists = await User.findById(body.userId);
    console.log('User exists:', userExists);
    if(!userExists){
            return NextResponse.json(
                { success: false, message: 'User does not exist' },
                { status: 400 }
            );
        }

    const newMedicalValidation = new MedicalValidation({
        document_metadata: {
            userId,
            ...document_metadata
        },
        uploadedFile,
        verificationInfo,
        isConsentChecked
    });

    await newMedicalValidation.save();

    return NextResponse.json({ message: "Medical validation uploaded successfully" }, { status: 201 });
}
catch (error) {
    console.error("Error uploading medical validation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
}