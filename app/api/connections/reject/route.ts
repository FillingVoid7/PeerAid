import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { ConnectionService } from "@/lib/Services/connectionService";
import { Types } from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { requestId } = await req.json();
    if (!requestId) {
      return NextResponse.json({ message: "requestId is required" }, { status: 400 });
    }
    await connectDB();
    const userId = new Types.ObjectId(session.user.id as string);
    const service = new ConnectionService();
    const result = await service.rejectConnectionRequest(requestId, userId);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("POST /api/connections/reject error", error);
    const message = error instanceof Error ? error.message : "Failed to reject request";
    return NextResponse.json({ message }, { status: 500 });
  }
}