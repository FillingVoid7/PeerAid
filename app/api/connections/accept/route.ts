import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { ConnectionService } from "@/lib/Services/connectionService";
import { Types } from "mongoose";
import { returnGuideProfile } from "@/lib/utilities/profileValidationService";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { seekerId } = await req.json();
    if (!seekerId) {
      return NextResponse.json({ message: "seekerId is required" }, { status: 400 });
    }
    await connectDB();
    const guideId = new Types.ObjectId(session.user.id as string);
    await returnGuideProfile(guideId);
    const service = new ConnectionService();
    const seekerObjectId = new Types.ObjectId(seekerId as string);
    const result = await service.acceptConnectionRequest(seekerObjectId, guideId);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("POST /api/connections/accept error", error);
    const message = error?.message || "Failed to accept request";
    return NextResponse.json({ message }, { status: 500 });
  }
}


