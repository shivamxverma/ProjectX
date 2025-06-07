import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import {ApiError} from '../utils/apiError.js';
import {uploadFileToCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js'

const registerUser = asyncHandler(async (req, res) => {
    const {fullName , email , username , password} = req.body;

    console.log("Request body:", req.body);

    console.log("Request files:", username);

    if(
        [fullName , email , password , username].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    console.log("Username:", username);

    const ExistedUser = await User.findOne({
        $or : [
            {username: username},
            {email: email}
        ]
    })

    console.log("Existed User:", ExistedUser);

    if(ExistedUser){
        throw new ApiError(409, "Username or Email already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    console.log("Avatar Local Path:", avatarLocalPath);

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
        username: username,
        email,
        fullName,
        password,
        avatar: avatar.url,
        coverImage: coverImage ? coverImage.url : null
    })

    const CreatedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if(!CreatedUser){
        throw new ApiError(500, "SomeThing Went Wrong Registering User");
    }


    console.log("Created User:", CreatedUser);

    if (!CreatedUser) {
        throw new ApiError(500, "SomeThing Went Wrong Registering User");
    }

    return res.status(201).json(
        new ApiResponse(200, CreatedUser, "User Registered Succesfully")
    );
});

export {registerUser};