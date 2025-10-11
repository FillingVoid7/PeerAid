import { NextRequest, NextResponse } from "next/server";
import { Conversation } from "@/models/chatConversation";
import connectDB from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
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