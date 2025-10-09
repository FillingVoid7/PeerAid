import { NextRequest, NextResponse } from "next/server";
import { getOnlineUsers } from "@/lib/websocket-client";

export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;
    
    // Get online users from WebSocket server
    const onlineUsers = await getOnlineUsers(conversationId);
    
    return NextResponse.json({
      success: true,
      conversationId,
      onlineUsers
    });
  } catch (error) {
    console.error('Error fetching online users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch online users' },
      { status: 500 }
    );
  }
}