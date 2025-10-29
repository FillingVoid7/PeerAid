import { NextRequest, NextResponse } from "next/server";
import MedicalValidation from "@/models/medicalValidation";
import connectDB from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json({ 
                error: "Unauthorized. Admin access required." 
            }, { status: 401 });
        }

        const url = new URL(req.url);
        const status = url.searchParams.get('status'); 
                                                                                                                        
        const query: { 'verificationInfo.verificationStatus'?: string } = {};
        if (status && ['pending', 'verified', 'rejected'].includes(status)) {
            query['verificationInfo.verificationStatus'] = status;
        }

        const medicalReports = await MedicalValidation.find(query)
            .select({
                'document_metadata': 1,
                'verificationInfo': 1,
                'uploadedFile': 1,
                'createdAt': 1,
                'updatedAt': 1
            })
            .sort({ 
                'verificationInfo.verificationStatus': 1, 
                'createdAt': -1 
            })
            .lean();

        const reportsByUserId: { [key: string]: typeof medicalReports } = {};
        medicalReports.forEach(report => {
            const userId = report.document_metadata?.userId?.toString() || 'unknown';
            if (!reportsByUserId[userId]) {
                reportsByUserId[userId] = [];
            }
            reportsByUserId[userId].push(report);
        });

        const totalCount = medicalReports.length;
        const pendingCount = medicalReports.filter(report => 
            report.verificationInfo?.verificationStatus === 'pending'
        ).length;
        const verifiedCount = medicalReports.filter(report => 
            report.verificationInfo?.verificationStatus === 'verified'
        ).length;
        const rejectedCount = medicalReports.filter(report => 
            report.verificationInfo?.verificationStatus === 'rejected'
        ).length;

        return NextResponse.json({
            success: true,
            data: {
                reportsByUserId,
                totalUsers: Object.keys(reportsByUserId).length,
                counts: {
                    total: totalCount,
                    pending: pendingCount,
                    verified: verifiedCount,
                    rejected: rejectedCount
                }
            }
        });

    } catch (error) {
        console.error("Error fetching all medical reports:", error);
        return NextResponse.json({ 
            error: "Internal server error" 
        }, { status: 500 });
    }
}