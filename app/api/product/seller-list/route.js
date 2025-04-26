import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";




export async function GET(request) {

  try {
    await connectDB()
    const {userId} = getAuth(request)
    const isSeller = authSeller(userId)
  
console.log("test")
    
    if(!isSeller){
      return NextResponse.json({success:false,message:"not authorized"})
      console.log("test2")
    }

    
    const products = await Product.find({})
    console.log(products)
    console.log("test3")
    return NextResponse.json({sucess:true,products})
  } catch (error) {
  
    return NextResponse.json({sucess:false,message:error.message})
  }


}