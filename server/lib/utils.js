
import jwt from "jsonwebtoken";

//function to generate a token for a user

const Key= process.env.JWT_SECRET;

export const generateToken =(userId)=>{

    const token =jwt.sign({userId},Key);
    return token ;
}