import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { MatchingService } from "@/lib/Services/matchingService";
import HealthProfile from "@/models/healthProfile";
import { Types } from "mongoose";

const matchingService = new MatchingService();

export async function GET(req: NextRequest) {
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
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
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

    const guideProfiles = await HealthProfile.find({
      role: 'guide',
      userId: { $ne: userId }
    }).populate('userId');

    if (!guideProfiles || guideProfiles.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          matches: [],
          totalCount: 0,
          summary: {
            highConnection: 0,
            mediumConnection: 0,
            lowConnection: 0
          }
        }
      });
    }

    const allMatches = await Promise.all(
      guideProfiles.map(async (guide) => {
        return await matchingService.calculateMatchScorePublic(seekerProfile, guide);
      })
    );

    const sortedMatches = allMatches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    const matchesWithExplanations = sortedMatches.map(match => ({
      ...match,
      explanation: matchingService.getMatchExplanation(match)
    }));

    const summary = {
      highConnection: matchesWithExplanations.filter(m => m.connectionStrength === 'high').length,
      mediumConnection: matchesWithExplanations.filter(m => m.connectionStrength === 'medium').length,
      lowConnection: matchesWithExplanations.filter(m => m.connectionStrength === 'low').length
    };

    return NextResponse.json({
      success: true,
      data: {
        matches: matchesWithExplanations,
        totalCount: matchesWithExplanations.length,
        summary
      }
    });

  } catch (error) {
    console.error('Match error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to find matches' },
      { status: 500 }
    );
  }
}