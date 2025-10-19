import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { getValidatedSeeker } from "@/lib/utilities/profileValidationService";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = new Types.ObjectId(session.user.id);
    console.log('Checking user role for ID:', userId);

    try {
      const seekerProfile = await getValidatedSeeker(userId);
      console.log('Found seeker profile:', !!seekerProfile);
      
      return NextResponse.json({
        success: true,
        data: {
          isSeeker: true,
          userRole: 'seeker'
        }
      });
    } catch (error) {
      console.log('User is not a seeker:', error instanceof Error ? error.message : error);
      
      return NextResponse.json({
        success: true,
        data: {
          isSeeker: false,
          userRole: 'guide' 
        }
      });
    }

  } catch (error) {
    console.error('Error checking user role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check user role' },
      { status: 500 }
    );
  }
}