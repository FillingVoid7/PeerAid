import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/models/message";
import connectDB from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    await connectDB();
    const { conversationId } = params;
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'alias email')
      .sort({ updatedAt: -1 });
    
    return NextResponse.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}