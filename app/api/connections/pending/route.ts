import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import { ConnectionService } from "@/lib/Services/connectionService";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roleParam = (searchParams.get("role") as 'seeker' | 'guide') || 'guide';

    await connectDB();
    const userId = new Types.ObjectId(session.user.id as string);
    const service = new ConnectionService();
    const items = await service.getPendingRequests(userId, roleParam);

    return NextResponse.json({ requests: items }, { status: 200 });
  } catch (error) {
    console.error("GET /api/connections/pending error", error);
    return NextResponse.json({ message: "Failed to load requests" }, { status: 500 });
  }
}


