import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import Video from "../models/video.model.js";
import { uploadVideoOnCloudinary, uploadImageOnCloudinary } from "../utils/fileupload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  // Check for basic details first
  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoFileBuffer = req.files?.videoFile?.[0]?.buffer;
  const thumbnailBuffer = req.files?.thumbnail?.[0]?.buffer;

  if (!videoFileBuffer) {
    throw new ApiError(400, "Video file is required");
  }
  if (!thumbnailBuffer) {
    throw new ApiError(400, "Thumbnail is required");
  }

  // Fire off both uploads at the same time so the user isn't kept waiting forever
  const [videoFile, thumbnail] = await Promise.all([
    uploadVideoOnCloudinary(videoFileBuffer),
    uploadImageOnCloudinary(thumbnailBuffer)
  ]);

  if (!videoFile) {
    throw new ApiError(500, "Failed to upload video file");
  }
  if (!thumbnail) {
    throw new ApiError(500, "Failed to upload thumbnail");
  }

  // Save the new video record into our DB
  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: videoFile.duration, // Grabbed straight from Cloudinary's response
    owner: req.user._id,
  });

  const createdVideo = await Video.findById(video._id);

  if (!createdVideo) {
    throw new ApiError(500, "Something went wrong while publishing the video");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdVideo, "Video published successfully"));
});

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // Build out an aggregation pipeline dynamically based on what's passed in
  const pipeline = [];

  if (query) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    });
  }

  if (userId) {
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  pipeline.push({ $match: { isPublished: true } });

  pipeline.push({
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
      pipeline: [
        {
          $project: {
            username: 1,
            avatar: 1,
            fullName: 1,
          },
        },
      ],
    },
  });

  pipeline.push({
    $addFields: {
      owner: { $arrayElemAt: ["$owner", 0] },
    },
  });

  if (sortBy && sortType) {
    pipeline.push({
      $sort: { [sortBy]: sortType === "asc" ? 1 : -1 },
    });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const aggregateQuery = Video.aggregate(pipeline);
  const videos = await Video.aggregatePaginate(aggregateQuery, options);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

import { Like } from "../models/like.model.js";

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  ).populate("owner", "username avatar fullName");

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const likeCount = await Like.countDocuments({ video: videoId });
  const videoObj = video.toObject();
  videoObj.likes = likeCount;

  return res
    .status(200)
    .json(new ApiResponse(200, videoObj, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;

  const thumbnailBuffer = req.file?.buffer;
  if (thumbnailBuffer) {
    const thumbnail = await uploadImageOnCloudinary(thumbnailBuffer);
    if (thumbnail) {
      updateFields.thumbnail = thumbnail.url;
    }
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateFields },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to toggle publish status");
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, `Video is now ${video.isPublished ? "published" : "unpublished"}`)
    );
});

const getUserVideos = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  const videos = await Video.find({ owner: userId }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "User videos fetched successfully"));
});

export {
  publishVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getUserVideos,
};
