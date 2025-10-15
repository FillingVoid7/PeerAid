import { NextRequest, NextResponse } from "next/server";
import { Conversation } from "@/models/chatConversation";
import { Message } from "@/models/message";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    if (!mongoose.models.Message) {
      require('@/models/message');
    }
    
    const body = await req.json();
    const { seekerId, guideId } = body;
    
    if (!seekerId || !guideId) {
      return NextResponse.json(
        { error: 'Both seekerId and guideId are required' },
        { status: 400 }
      );
    }
    
    let conversation = await Conversation.findOne({
      'participants.seeker': seekerId,
      'participants.guide': guideId
    });
    
    if (!conversation) {
      conversation = new Conversation({
        participants: {
          seeker: seekerId,
          guide: guideId
        },
        status: 'active'
      });
      await conversation.save();
    }
    
    await conversation.populate('participants.seeker', 'alias email');
    await conversation.populate('participants.guide', 'alias email');
    await conversation.populate('lastMessage', 'content createdAt');
    
    return NextResponse.json({ 
      success: true,
      conversation 
    });
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}