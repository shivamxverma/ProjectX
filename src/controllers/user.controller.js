import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import {ApiError} from '../utils/apiError.js';
import {uploadFileToCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js'

const registerUser = asyncHandler(async (req, res) => {
    const {username , email , fullName , password} = req.body;

    if(
        [fullName, username, email, password].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    const ExistedUser = User.findOne({
        $or : [
            {username: username.toLowerCase()},
            {email: email.toLowerCase()}
        ]
    })

    if(ExistedUser){
        throw new ApiError(409, "Username or Email already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar Image are required");
    }

    const avatar = await uploadFileToCloudinary(avatarLocalPath);

    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar image");
    }

    const coverImage = coverImageLocalPath ? await uploadFileToCloudinary(coverImageLocalPath) : null;

    if(coverImageLocalPath && !coverImage){
        throw new ApiError(500, "Failed to upload cover image");
    } 

    const user = await User.create({
        username : username.toLowerCase(),
        email,
        fullName,
        password,
        avatar: avatar.url,
        coverImage: coverImage ? coverImage.url : null
    })

    const CreatedUser = User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!CreatedUser){
        throw new ApiError(500, "SomeThing Went Wrong Registering User");
    }


    return res.status(201).json(
        new ApiResponse(200,CreatedUser,"User Registered Succesfully")
    );
});

export {registerUser};