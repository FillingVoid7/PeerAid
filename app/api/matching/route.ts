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

    const guideProfile = await HealthProfile.findOne({ 
      userId, 
      role: 'guide' 
    });

    if (seekerProfile) {
      // User is a seeker - find matching guides
      const guideProfiles = await HealthProfile.find({
        role: 'guide',
        userId: { $ne: userId }
      }).populate('userId', 'alias email');

      if (!guideProfiles || guideProfiles.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            matches: [],
            totalCount: 0,
            userRole: 'seeker',
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
          userRole: 'seeker',
          summary
        }
      });

    } else if (guideProfile) {
      // User is a guide - find seeker profiles (no matching algorithm)
      const seekerProfiles = await HealthProfile.find({
        role: 'seeker',
        userId: { $ne: userId }
      }).populate('userId', 'alias email');

      if (!seekerProfiles || seekerProfiles.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            matches: [],
            totalCount: 0,
            userRole: 'guide',
            summary: {
              highConnection: 0,
              mediumConnection: 0,
              lowConnection: 0
            }
          }
        });
      }

      // For guides, return seeker profiles without matching algorithm
      const seekerMatches = seekerProfiles.slice(0, limit).map(seeker => ({
        seekerProfile: {
          ...seeker.toObject(),
          alias: (seeker.userId as any)?.alias || null
        },
        matchScore: 0, 
        breakdown: {
          conditionMatch: 0,
          symptomMatch: 0,
          demographicMatch: 0,
          treatmentMatch: 0,
          verificationBonus: 0,
        },
        sharedSymptoms: [],
        effectiveTreatments: [],
        connectionStrength: 'low' as const,
        explanation: 'Seeker profile available for connection'
      }));

      return NextResponse.json({
        success: true,
        data: {
          matches: seekerMatches,
          totalCount: seekerMatches.length,
          userRole: 'guide',
          summary: {
            highConnection: 0,
            mediumConnection: 0,
            lowConnection: seekerMatches.length
          }
        }
      });

    } else {
      return NextResponse.json(
        { success: false, error: 'No profile found. Please create a seeker or guide profile first.' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Match error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to find matches' },
      { status: 500 }
    );
  }
}