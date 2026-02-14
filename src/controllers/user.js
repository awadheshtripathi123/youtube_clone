import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/fileupload.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';


const generateAccessAndRefreshTokens = async(userId) => {
  try {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ValidateBeforeSave: false});

  return {
    accessToken,
    refreshToken
  }
  }
  catch(error) {
    throw new ApiError(500, 'Something went wrong while generating access and refresh tokens');
  }
}


const registerUser = asyncHandler(async (req, res) => {
  // Your registration logic here
  // get user data from frontend
  // validate the data --not empty, valid email, password strength
  // check if user already exists : email , username
  // check for image , check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token from response
  // check for user creation
  // return response to frontend

  const { fullName, email, username, password } = req.body;
  if(fullName === '' || email === '' || username === '' || password === '') {
    return new ApiError(400, 'All fields are required');
  }

  if(!email.includes('@')) {
    return new ApiError(400, 'Invalid email');
  }
  if(password.length < 6) {
    return new ApiError(400, 'Password must be at least 6 characters');
  }
  // check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if(existedUser) {
    return new ApiError(409, 'User already exists');
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
  coverImageLocalPath = req.files.coverImage[0].path;
}

  if(!avatarLocalPath) {
    return new ApiError(400, 'Avatar is required');
  }
 const avatar = await uploadOnCloudinary(avatarLocalPath);
 const coverImage = await uploadOnCloudinary(coverImageLocalPath);

 if(!avatar) {
  return new ApiError(500, 'Failed to upload avatar');
 }
 
 const user = await User.create({
  fullName,
  email,
  username: username.toLowerCase(),
  password,
  avatar: avatar.url,
  coverImage: coverImage?.url || ""
 })

 const createdUser = await User.findById(user._id).select(
  '-password -refreshToken'
 )

 if(!createdUser) {
  return new ApiError(500, 'Something went wrong while registering the user');
 }

 return res.status(201).json(
  new ApiResponse(200, createdUser, 'User registered successfully')
 )


});

const loginUser = asyncHandler(async (req, res) => {
  // Your login logic here
  // get user data from frontend
  // validate the data --not empty, valid email, password strength
  // check if user exists : email , username
  // compare password
  // generate access token and refresh token
  // save refresh token in db
  // return response to frontend with access token and user data

  const {email , username , password} = req.body;
  if(!(username || email)){
    return new ApiError(400, 'username or email is required');
  }

  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  if(!user) {
    return new ApiError(404, 'User not found');
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid) {
    return new ApiError(401, 'Invalid user credentials');
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select('-password -refreshToken');

  const options = {
    httpOnly: true,
    secure: true,
  }
 
  return res
  .status(200)
  .cookie('accessToken', accessToken, options)
  .cookie('refreshToken', refreshToken, options)
  .json(
    new ApiResponse(
      200, 
      {
        user: loggedInUser,
        refreshToken
       }, 
      'User logged in successfully'
    )
  )






  
})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken: undefined
      }
    },
      {
        new: true
      } 
  )

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
  .status(200)
  .clearCookie('accessToken', options)
  .clearCookie('refreshToken', options)
  .json(
    new ApiResponse(200, {}, 'User logged out successfully')
  )

})

const RefreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;


if(!incomingRefreshToken){
  return new ApiError(400, 'unauthorized request');
}

try {
  const decodedToken =  jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  )
  
  const user = await User.findById(decodedToken?._id);
  if(!user){
    return new ApiError(401, 'Invalid refresh token');
  }
  
  if(incomingRefreshToken !== user?.refreshToken){
    return new ApiError(401, 'refresh token is expired or used');
  }
  
  const options = {
    httpOnly: true,
    secure: true,
  }
  
  const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
  
  return res
  .status(200)
  .cookie('accessToken', accessToken, options)
  .cookie('refreshToken', newRefreshToken, options)
  .json(
    new ApiResponse(
      200,
      { accessToken, refreshToken: newRefreshToken },
      'Access token refreshed successfully'
    )
  )
} catch (error) {
  throw new ApiError(401, error?.message || 'Invalid refresh token');
}

})

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if(!oldPassword || !newPassword) {
    return new ApiError(400, 'Both old and new passwords are required');
  }

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if(!isPasswordCorrect){
    return new ApiError(400, 'Invalid old password');
  }

  user.password = newPassword;
  await user.save({ValidateBeforeSave: false});

  return res
  .status(200)
  .json(
    new ApiResponse(200, {}, 'Password changed successfully')
  )
})



export {registerUser, loginUser, logoutUser, RefreshAccessToken};