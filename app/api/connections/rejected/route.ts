import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { Types } from "mongoose";
import ConnectionRequest from "@/models/connectionRequest";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    await connectDB();
    const userId = new Types.ObjectId(session.user.id as string);
    
    console.log('Rejected endpoint - userId:', userId);

    // Get rejected connections for the user using User IDs
    const rejectedRequests = await ConnectionRequest.find({
      $or: [
        { fromUser: userId, status: 'rejected' },
        { toUser: userId, status: 'rejected' }
      ]
    })
    .populate('fromUser', 'alias email')
    .populate('toUser', 'alias email')
    .sort({ updatedAt: -1 });

    console.log('Rejected endpoint - found requests:', rejectedRequests.length);

    return NextResponse.json({ 
      requests: rejectedRequests,
      count: rejectedRequests.length
    }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/connections/rejected error", error);
    const message = error instanceof Error ? error.message : "Failed to load rejected connections";
    return NextResponse.json({ message }, { status: 500 });
  }
}
