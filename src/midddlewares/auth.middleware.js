import { ApiError } from "../utils/apiError";
import asyncHandler from "../utils/asyncHandler";
import jwt from 'jsonwebtoken';
import {User} from '../models/user.model'


export const verifyJWT = asyncHandler(async(req,res , next)=>{
    try {
        const token = req.cookes?.AccessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new ApiError(401,"Unauthorized Request");
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
        next();
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token");
    }
})

