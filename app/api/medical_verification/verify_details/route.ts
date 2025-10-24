import { NextRequest, NextResponse } from "next/server";
import MedicalValidation from "@/models/medicalValidation";
import connectDB from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json({ 
                error: "Unauthorized. Admin access required." 
            }, { status: 401 });
        }

        const body = await req.json();
        const { userId, verificationStatus} = body;
        
        if (!userId) {
            return NextResponse.json({ 
                error: "userId is required" 
            }, { status: 400 });
        }

        if (!verificationStatus || !["pending", "verified", "rejected"].includes(verificationStatus)) {
            return NextResponse.json({ 
                error: "verificationStatus is required and must be 'pending', 'verified', or 'rejected'" 
            }, { status: 400 });
        }

        const medicalReport = await MedicalValidation.findOne({ "document_metadata.userId": userId });
        
        if (!medicalReport) {
            return NextResponse.json({ 
                error: "Medical report not found for this user" 
            }, { status: 404 });
        }

        const updateData: {
            "verificationInfo.verificationStatus": string;
            "verificationInfo.isVerified": boolean;
            "verificationInfo.verifiedAt"?: Date;
        } = {
            "verificationInfo.verificationStatus": verificationStatus,
            "verificationInfo.isVerified": verificationStatus === "verified"
        };
        if (verificationStatus === "verified" || verificationStatus === "rejected") {
            updateData["verificationInfo.verifiedAt"] = new Date();
        }   

        const updatedReport = await MedicalValidation.findByIdAndUpdate(
            medicalReport._id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return NextResponse.json({
            success: true,
            message: `Medical report ${verificationStatus} successfully`,
            data: {
                verificationStatus: updatedReport?.verificationInfo.verificationStatus,
                isVerified: updatedReport?.verificationInfo.isVerified,
                verifiedAt: updatedReport?.verificationInfo.verifiedAt,
            }
        });

    } catch (error) {
        console.error("Error updating verification status:", error);
        return NextResponse.json({ 
            error: "Internal server error" 
        }, { status: 500 });
    }
}