import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { ConnectionService } from "@/lib/Services/connectionService";
import { Types } from "mongoose";
import { getValidatedSeeker } from "@/lib/utilities/profileValidationService";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { guideId, requesterMessage } = await req.json();
    if (!guideId) {
      return NextResponse.json({ error: 'guideId is required' }, { status: 400 });
    }
    await connectDB();
    
    const requesterId = new Types.ObjectId(session.user.id as string);
    await getValidatedSeeker(requesterId);
    const service = new ConnectionService();
    const guideObjectId = new Types.ObjectId(guideId as string);
    const created = await service.sendConnectionRequest(requesterId, guideObjectId, requesterMessage);
    return NextResponse.json({ request: created }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/connections/send error", error);
    const message = error?.message || "Failed to send request";
    return NextResponse.json({ message }, { status: 500 });
  }
}


