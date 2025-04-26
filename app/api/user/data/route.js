import connectDB from "@/config/db"
import { getAuth } from "@clerk/nextjs/server"
import User from "@/models/User"
import { NextResponse } from "next/server";



export async function GET(request){
  try {
    await connectDB()
    const {userId} = getAuth(request)
    console.log(userId)

    
     const user = await User.findById(userId)
   

    

    if(!user){
      return NextResponse.json({success:false,message:"User Not found"})
    }
    return NextResponse.json({success:true,user})
    
  } catch (error) {

    return NextResponse.json({success:false,message:error.message})
    
  }

}