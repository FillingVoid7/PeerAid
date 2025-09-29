import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { MatchingService } from "@/lib/Services/matchingService";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const seekerId = new Types.ObjectId(session.user.id as string);

    const matchingService = new MatchingService();
    const results = await matchingService.findMatches(seekerId, 20);

    return NextResponse.json({ matches: results }, { status: 200 });
  } catch (error) {
    console.error("GET /api/matching/find error", error);
    return NextResponse.json(
      { message: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}


