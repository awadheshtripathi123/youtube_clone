import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const existingLike = await Like.findOne({
    user: req.user._id,
    video: videoId,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, { liked: false }, "Video unliked successfully"));
  }

  const like = await Like.create({
    user: req.user._id,
    video: videoId,
  });

  const createdLike = await Like.findById(like._id);

  if (!createdLike) {
    throw new ApiError(500, "Failed to like video");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { liked: true }, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Comment id is required");
  }

  const existingLike = await Like.findOne({
    user: req.user._id,
    comment: commentId,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, { liked: false }, "Comment unliked successfully"));
  }

  const like = await Like.create({
    user: req.user._id,
    comment: commentId,
  });

  const createdLike = await Like.findById(like._id);

  if (!createdLike) {
    throw new ApiError(500, "Failed to like comment");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { liked: true }, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
  }

  const existingLike = await Like.findOne({
    user: req.user._id,
    tweet: tweetId,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, { liked: false }, "Tweet unliked successfully"));
  }

  const like = await Like.create({
    user: req.user._id,
    tweet: tweetId,
  });

  const createdLike = await Like.findById(like._id);

  if (!createdLike) {
    throw new ApiError(500, "Failed to like tweet");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { liked: true }, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const videos = await Like.find({ user: req.user._id, video: { $exists: true } })
    .populate("video")
    .sort({ createdAt: -1 });

  const likedVideos = videos
    .map((like) => like.video)
    .filter((video) => video !== null);

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
