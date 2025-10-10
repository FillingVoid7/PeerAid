import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/models/message";
import connectDB from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    await connectDB();
    const { conversationId } = params;
    const body = await req.json();
    const { userId, messageIds } = body;
    
    if (!userId || !messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { error: 'userId and messageIds array are required' },
        { status: 400 }
      );
    }
    
    await Message.updateMany(
      { 
        _id: { $in: messageIds },
        conversationId,
        sender: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId },
        status: 'read'
      }
    );
    
    return NextResponse.json({ 
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}