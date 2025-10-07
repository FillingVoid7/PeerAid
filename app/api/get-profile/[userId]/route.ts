import { NextRequest,NextResponse } from "next/server";
import HealthProfile from "@/models/healthProfile";
import connectDB from "@/lib/db";

export async function GET (
    req: NextRequest,
    {params} : {params: Promise<{userId:string}>}
) {
    try{
       await connectDB();
       const {userId} = await params; 
       if(!userId){
        return NextResponse.json(
            {message:'User Id not found'},
            {status:400}
        );
    }

    const profile = await HealthProfile.findOne({userId});
    return NextResponse.json(
        {profile},
        {status:200}
    );
    }catch(error){
        return NextResponse.json(
            {message:'Error fetching profile',error},
            {status:500}
    );
    }
}

export async function PATCH(
    req: NextRequest,
    {params} : {params: Promise<{userId:string}>}
) {
    try{
         await connectDB();
         const {userId} = await params;
         const body = await req.json();
         const updatedProfile = await HealthProfile.findOneAndUpdate(
             {userId},
             {...body},
             {new:true}
         );
         return NextResponse.json(
             {profile:updatedProfile},
             {status:200}
         );
    }catch(error){
        return NextResponse.json(
            {message:'Error updating profile',error},
            {status:500}
        );
    }
}


export async function DELETE(
    req: NextRequest,
    {params} : {params: Promise<{userId:string}>}
) {
    try{
            await connectDB();
            const {userId} = await params;
            await HealthProfile.findOneAndDelete({userId});
            return NextResponse.json(
                {message:'Profile deleted successfully'},
                {status:200}
            );
    }
    catch(error){
        return NextResponse.json(
            {message:'Error deleting profile',error},
            {status:500}
        );
    }
}