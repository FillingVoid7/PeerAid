import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { Types } from "mongoose";
import ConnectionRequest from "@/models/connectionRequest";
import HealthProfile from "@/models/healthProfile";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    await connectDB();
    const userId = new Types.ObjectId(session.user.id as string);
    
    console.log('Accepted endpoint - userId:', userId);

    const acceptedRequests = await ConnectionRequest.find({
      $or: [
        { fromUser: userId, status: 'accepted' },
        { toUser: userId, status: 'accepted' }
      ]
    })
    .populate('fromUser', 'alias email')
    .populate('toUser', 'alias email')
    .sort({ updatedAt: -1 });

    console.log('Accepted endpoint - found requests:', acceptedRequests.length);

    return NextResponse.json({ 
      requests: acceptedRequests,
      count: acceptedRequests.length
    }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/connections/accepted error", error);
    const message = error?.message || "Failed to load accepted connections";
    return NextResponse.json({ message }, { status: 500 });
  }
}
