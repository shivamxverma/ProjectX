import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import {ApiError} from '../utils/ApiError.js';
import {uploadFileToCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js'
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        console.log(user.generateAccessToken);
        const AccesToken = await user.generateAccessToken;
        const RefreshToken = await user.generateRefreshToken;

        console.log(AccesToken);
        console.log(RefreshToken);

        user.refreshToken = RefreshToken;

        await user.save({validateBeforeSave : false});

        return {AccesToken,RefreshToken};

    } catch (error) {
        throw new ApiError(500,"Something Went Wrong While generating refresh and access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {fullName , email , username , password} = req.body;

    console.log("Body",req.body);
    console.log(Object.keys(req.body));


    if(
        [fullName , email , password , username].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    const ExistedUser = await User.findOne({
        $or : [
            {username: username},
            {email: email}
        ]
    })

    console.log(ExistedUser);

    if(ExistedUser){
        throw new ApiError(409, "Username or Email already exists");
    }
    
    console.log("Files",req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log("Avatar Local Path",avatarLocalPath);
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

    if (!CreatedUser) {
        throw new ApiError(500, "SomeThing Went Wrong Registering User");
    }

    return res.status(201).json(
        new ApiResponse(200, CreatedUser, "User Registered Succesfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const {username , email , password} = req.body;

    if(!username && !email){
        throw new ApiError(400,"Username or Email is Required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if(!user){
        throw new ApiError(404,"User doesn't Exist");
    }

    console.log(user.isPasswordCorrect);

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user Password");
    }

    const {AccesToken,RefreshToken} = await generateAccessTokenAndRefreshToken(user._id);

    console.log(AccesToken);
    console.log(RefreshToken);

    console.log(user);

    const LoggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    console.log(LoggedInUser);

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("AccessToken",AccesToken,options)
    .cookie("RefreshToken",RefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: LoggedInUser,
                RefreshToken,
                AccesToken
            },
            "User LoggedIn SuccessFully",
        )
    )
});

const LogoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("AccessToken",AccesToken)
    .clearCookie("RefreshToken",RefreshToken)
    .json(new ApiResponse(200,{},"User logged out"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.RefreshToken || req.body.RefreshToken;
    
    if(!incomingRefreshToken){
        throw new ApiError(400, "Refresh Token is required");
    }

    try {
        const docodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(docodedToken?._id);
    
        if(!user){
            throw new ApiError(404, "Invalid Refresh Token");
        }
    
        if(user?.refreshToken !== incomingRefreshToken){
            throw new ApiError(403, "Invalid Refresh Token");
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {AccesToken,newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id);
    
    
        return res
        .status(200)
        .cookie("AccessToken",AccesToken,options)
        .cookie("RefreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {AccesToken,newRefreshToken},
                "Access Token is Refreshed Successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh Token");
    }

});

const ChangeCurrentPassword = asyncHandler(async(req,res)=>{
    const {OldPassword , newPassword} = req.body;

    const user = await User.findById(req.user?._id);

    if(!user){
        throw new ApiError(401,"User Not Exist");
    }

    const isValidPassword = await user.isPasswordCorrect(OldPassword);

    if(!isValidPassword){
        throw new ApiError(401,"Password is incorrect");
    }

    user.password = newPassword;
    
    await user.save({validateBeforeSave : false});

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
})

const getCurrentUser = asyncHandler(async (req,res)=> {
    return res.status(200).json(
        new ApiResponse(200,req.user,"Current User Fetched Successfully")
    )
})

const updateAccountDetails = asyncHandler(async (req,res)=> {
    const {fullName , email} = req.body;

    if(!fullName && !email){
        throw new ApiError(400,"All Fields Are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName : fullName,
                email : email
            }
        },
        {new : true}
    ).select("-password");

    res.status(200).json(new ApiResponse(200,user,"Account details Updated Successfully"));
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is Not Present");
    }

    const avatar = await uploadFileToCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400,"Error While uploading on avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                avatar : avatar.url
            }
        },
        {new : true}
    ).select("-password");

    return res.status(200).json(new ApiResponse(200,user,"Avatar Image files is Updated"));
})


const updateUserCover = asyncHandler(async(req,res)=>{
    const coverLocalPath = req.file?.path;

    if(!coverLocalPath){
        throw new ApiError(400,"Avatar file is Not Present");
    }

    const cover = await uploadFileToCloudinary(coverLocalPath);

    if(!cover.url){
        throw new ApiError(400,"Error While uploading on cover");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                coverImage : cover.url
            }
        },
        {new : true}
    ).select("-password");

    return res.status(200).json(new ApiResponse(200,user,"Cover Image files is Updated"));
})

export {
    registerUser,
    loginUser,
    LogoutUser,
    refreshAccessToken,
    ChangeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar
};