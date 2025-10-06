import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { MatchingService } from "@/lib/Services/matchingService";
import HealthProfile from "@/models/healthProfile";
import { Types } from "mongoose";

const matchingService = new MatchingService();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ guideId: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please login to access this resource.' },
        { status: 401 }
      );
    }

    const userId = new Types.ObjectId(session.user.id);
    const { guideId } = await params;

    if (!guideId || !Types.ObjectId.isValid(guideId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid guide ID provided' },
        { status: 400 }
      );
    }

    const seekerProfile = await HealthProfile.findOne({ 
      userId, 
      role: 'seeker' 
    });

    if (!seekerProfile) {
      return NextResponse.json(
        { success: false, error: 'Seeker profile not found. Please create a seeker profile first.' },
        { status: 404 }
      );
    }

    const guideProfile = await HealthProfile.findOne({
      _id: new Types.ObjectId(guideId),
      role: 'guide'
    }).populate('userId', 'alias email');

    if (!guideProfile) {
      return NextResponse.json(
        { success: false, error: 'Guide profile not found' },
        { status: 404 }
      );
    }

    const match = await matchingService.calculateMatchScorePublic(seekerProfile, guideProfile);
    
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Failed to calculate match score' },
        { status: 500 }
      );
    }

    const explanation = matchingService.getMatchExplanation(match);

    return NextResponse.json({
      success: true,
      data: {
        ...match,
        explanation
      }
    });

  } catch (error) {
    console.error('Match details error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { success: false, error: 'Failed to get match details' },
      { status: 500 }
    );
  }
}