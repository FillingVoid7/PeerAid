import { NextRequest, NextResponse } from "next/server";
import { Conversation } from "@/models/chatConversation";
import { Message } from "@/models/message";
import User from "@/models/User";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
    {params} : {params: Promise<{userId:string}>}
) {
  try {
    await connectDB();
    
    if (!mongoose.models.Message) {
      require('@/models/message');
    }
    
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }
    
    const conversations = await Conversation.find({
      $or: [
        { 'participants.seeker': userId },
        { 'participants.guide': userId }
      ]
    })
    .populate('participants.seeker', 'alias email')
    .populate('participants.guide', 'alias email')
    .populate('lastMessage', 'content createdAt')
    .sort({ updatedAt: -1 });
    
    return NextResponse.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}