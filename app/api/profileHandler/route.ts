import { NextRequest,NextResponse } from "next/server";
import HealthProfile from "@/models/healthProfile";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req:NextRequest){
    try{
    await connectDB();
    const body = await req.json();
    
    const userExists = await User.findById(body.userId);
    console.log('User exists:', userExists);
    if(!userExists){
        return NextResponse.json(
            { success: false, message: 'User does not exist' },
            { status: 400 }
        );
    }

    const existingProfile = await HealthProfile.findOne({ userId: body.userId });
    console.log('Existing profile:', existingProfile);
    if(existingProfile){
        return NextResponse.json(
            { success: false, message: 'Profile already exists for this user' },
            { status: 400 }
        );
    }

    const newProfile = new HealthProfile(body);
    const savedNewProfile = await newProfile.save();

    return NextResponse.json(
        { success: true, message: 'Profile created successfully', profile: savedNewProfile },
        { status: 201 }
    );


} catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
        { success: false, message: 'Error creating profile' },
        { status: 500 }
    );
}

}