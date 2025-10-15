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
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    let targetIds: string[] = [];

    if (Array.isArray(messageIds) && messageIds.length > 0) {
      targetIds = messageIds;
    } else {
      const unread = await Message.find({
        conversationId,
        sender: { $ne: userId },
        status: { $ne: 'read' }
      }).select('_id');
      targetIds = unread.map((m: any) => String(m._id));
    }

    if (targetIds.length === 0) {
      return NextResponse.json({ success: true, message: 'No messages to update', updatedIds: [] });
    }

    await Message.updateMany(
      { 
        _id: { $in: targetIds },
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
      message: 'Messages marked as read',
      updatedIds: targetIds
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}