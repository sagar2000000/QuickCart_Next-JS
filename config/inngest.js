import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import { z } from "zod";  // Install it if missing!

import Order from "@/models/Order";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

// inngest function to save user data to a database 
export const syncUserCreation = inngest.createFunction(
  {
    id: 'sync-user-from-clerk'
  },
  {
    event: 'clerk/user.created'
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    
    const userData = {
      _id: id,
      email: email_addresses[0]?.email_address,  // Use optional chaining to prevent errors
      name: `${first_name} ${last_name}`,
      imageUrl: image_url || "",  // Fix: Using correct image_url field
    };

    console.log("User Data before saving:", userData);  // Debugging log

    await connectDB();
    await User.create(userData);
  }
);




// Inngest function to update userData in database

export const syncUserUpdation = inngest.createFunction(
  {
    id:"update-user-from-clerk"
  },
  {
    event:"clerk/user.updated"
  },
  async ({event})=>{
    const {id, first_name,last_name,email_addresses,image_url} = event.data;
    const userData = {
      _id:id,
      email:email_addresses[0].email_address,
      name:first_name+ " "+ last_name,
     imageUrl:image_url
    }
    await connectDB()
    await User.findByIdAndUpdate(id,userData)

  }
)

//Inngest function to delete user from database

export const syncuserDeletion = inngest.createFunction(
  
{
  id:"delete-user-with-clerk"
},
{
  event:"clerk/user.deleted"
},
async({event})=>{
  const {id} = event.data;

  await connectDB()
  await User.findByIdAndDelete(id)
}
)


export const createUserOrder = inngest.createFunction(
  {
    id: 'create-user-order',
  },
  {
    event: 'order/created',
    batch: {
      maxSize: 5,
      timeout: '5s'
    },
    data: z.object({
      userId: z.string(),
      items: z.array(z.string()),
      amount: z.number(),
      address: z.string(),
      date: z.string(),
    }),
  },
  async ({ events }) => {
    const orders = events.map((event) => ({
      userId: event.data.userId,
      items: event.data.items,
      amount: event.data.amount,
      address: event.data.address,
      date: event.data.date,
    }));

    await connectDB();
    await Order.insertMany(orders);

    return { success: true, processed: orders.length };
  }
);
