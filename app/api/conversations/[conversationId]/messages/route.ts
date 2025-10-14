import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/models/message";
import connectDB from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    await connectDB();
    const { conversationId } = await params;
    
    const messages = await Message.find({ conversationId })
      .populate('sender', 'alias email')
      .sort({ createdAt: 1 }); // Sort by createdAt ascending (oldest first)
    
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