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
    const pendingRequests = await ConnectionRequest.find({
      $or: [
        { fromUser: userId, status: 'pending' },
        { toUser: userId, status: 'pending' }
      ]
    })
    .populate('fromUser', 'alias email')
    .populate('toUser', 'alias email')
    .sort({ createdAt: -1 });

    return NextResponse.json({ 
      requests: pendingRequests,
      count: pendingRequests.length
    }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/connections/pending error", error);
    const message = error instanceof Error ? error.message : "Failed to load pending connections";
    return NextResponse.json({ message }, { status: 500 });
  }
}


