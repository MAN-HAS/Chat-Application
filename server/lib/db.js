import mongoose from "mongoose";

const DB_URL=process.env.MONGODB_URL
export const connectDB= async ()=>{
    try{

        mongoose.connection.on( "connected", ()=> console.log("Database Connected"));


        await mongoose.connect(`${DB_URL}/chat-app`)
    }
    catch(error){
        console.log(error);
    }
}