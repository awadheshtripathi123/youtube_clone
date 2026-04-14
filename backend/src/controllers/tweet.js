import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  if (content.length > 280) {
    throw new ApiError(400, "Content must not exceed 280 characters");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  const createdTweet = await Tweet.findById(tweet._id);

  if (!createdTweet) {
    throw new ApiError(500, "Failed to create tweet");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdTweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 }).lean();

  for (let tweet of tweets) {
    tweet.likes = await Like.countDocuments({ tweet: tweet._id });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

import { Like } from "../models/like.model.js";

const getAllTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.find({ isPublic: true })
    .populate("owner", "username avatar fullName")
    .sort({ createdAt: -1 })
    .lean();

  for (let tweet of tweets) {
    tweet.likes = await Like.countDocuments({ tweet: tweet._id });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this tweet");
  }

  tweet.content = content;
  await tweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this tweet");
  }

  await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, getAllTweets, updateTweet, deleteTweet };
