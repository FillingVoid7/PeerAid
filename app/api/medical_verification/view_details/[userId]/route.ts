import { NextRequest,NextResponse } from "next/server";
import MedicalValidation, { IMedicalValidation } from "@/models/medicalValidation";
import connectDB from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export async function GET(
    req: NextRequest,
    {params} : {params: Promise<{userId:string}>}
) {
    try{
        await connectDB();
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json(
                {message: 'Unauthorized. Please login to access this resource.'},
                {status: 401}
            );
        }

        const {userId} = await params;
        if(!userId){
            return NextResponse.json(
                {message:'User Id not found'},
                {status:400}
            );
        }

        const report = await MedicalValidation.findOne({"document_metadata.userId":userId});
        if(!report){
            return NextResponse.json(
                {message:'Medical report not found for this user'},
                {status:404}
            );
        }
        return NextResponse.json(
            {report},
            {status:200}
        );
    }
    catch(error){
        console.error('Error fetching medical report:', error);
        return NextResponse.json(
            {message:'Error fetching medical report'},
            {status:500}
        );
    }
}

export async function PATCH(
    req: NextRequest,
    {params} : {params: Promise<{userId:string}>}
) {
    try{
        await connectDB();
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.id) {
            return NextResponse.json(
                {message: 'Unauthorized. Please login to access this resource.'},
                {status: 401}
            );
        }

        const {userId} = await params;
        if(!userId){
            return NextResponse.json(
                {message:'User Id not found'},
                {status:400}
            );
        }

        const existingReport = await MedicalValidation.findOne({"document_metadata.userId":userId});
        if (!existingReport) {
            return NextResponse.json(
                {message: 'Medical report not found for this user'},
                {status: 404}
            );
        }

        const body = await req.json();
        const updateData: Partial<IMedicalValidation> = {};
        
        if (body.document_metadata) {
            updateData.document_metadata = {
                ...body.document_metadata,
                userId: userId 
            };
        }
        
        if (body.uploadedFile) {
            updateData.uploadedFile = body.uploadedFile;
        }
        
        if (body.verificationInfo) {
            updateData.verificationInfo = body.verificationInfo;
        }
        
        if (body.isConsentChecked !== undefined) {
            updateData.isConsentChecked = body.isConsentChecked;
        }

        const updatedReport = await MedicalValidation.findOneAndUpdate(
            {"document_metadata.userId":userId},
            {$set: updateData},
            {new: true, runValidators: true}
        );

        return NextResponse.json(
            {
                message: 'Medical report updated successfully',
                report: updatedReport
            },
            {status:200}
        );
    }
    catch(error){
        console.error('Error updating medical report:', error);
        return NextResponse.json(
            {message:'Error updating medical report'},
            {status:500}
        );
    }
}


export async function DELETE(
    req: NextRequest,
    {params} : {params: Promise<{userId:string}>}
) {
    try{
        await connectDB();
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.id) {
            return NextResponse.json(
                {message: 'Unauthorized. Please login to access this resource.'},
                {status: 401}
            );
        }

        const {userId} = await params;
        if(!userId){
            return NextResponse.json(
                {message:'User Id not found'},
                {status:400}
            );
        }

        const existingReport = await MedicalValidation.findOne({"document_metadata.userId":userId});
        if(!existingReport){
            return NextResponse.json(
                {message:'Medical report not found for this user'},
                {status:404}
            );
        }

        try {
            if (existingReport.uploadedFile && existingReport.uploadedFile.publicId) {
                await cloudinary.uploader.destroy(existingReport.uploadedFile.publicId);
                console.log(`Successfully deleted file from Cloudinary: ${existingReport.uploadedFile.publicId}`);
            }
        } catch (cloudinaryError) {
            console.error('Error deleting file from Cloudinary:', cloudinaryError);
        }

        const deletedReport = await MedicalValidation.findOneAndDelete({"document_metadata.userId":userId});
        
        if (!deletedReport) {
            return NextResponse.json(
                {message:'Medical report not found for deletion'},
                {status:404}
            );
        }
        
        return NextResponse.json(
            {
                message:'Medical report and associated files deleted successfully',
                deletedReport: {
                    id: deletedReport._id,
                    userId: deletedReport.document_metadata.userId,
                    documentType: deletedReport.document_metadata.documentType
                }
            },
            {status:200}
        );
    }   
    catch(error){
        console.error('Error deleting medical report:', error);
        return NextResponse.json(
            {message:'Error deleting medical report'},
            {status:500}
        );
    }
}