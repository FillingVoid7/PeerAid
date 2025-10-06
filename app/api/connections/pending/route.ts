import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { Types } from "mongoose";
import ConnectionRequest from "@/models/connectionRequest";
import { returnGuideProfile } from "@/lib/utilities/profileValidationService";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const guideId = new Types.ObjectId(session.user.id as string);
    await returnGuideProfile(guideId);
    const pendingRequests = await ConnectionRequest.find({
      toUser: guideId, 
      status: 'pending'
    })
    .populate('fromUser')  
    .populate('toUser')    
    .sort({ createdAt: -1 });  

    return NextResponse.json({ requests: pendingRequests }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/connections/pending error", error);
    const message = error?.message || "Failed to load pending requests";
    return NextResponse.json({ message }, { status: 500 });
  }
}


