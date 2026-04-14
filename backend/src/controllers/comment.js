import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content, parentCommentId } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
    parentComment: parentCommentId || null,
  });

  if (parentCommentId) {
    await Comment.findByIdAndUpdate(parentCommentId, { $push: { replies: comment._id }});
  }

  const createdComment = await Comment.findById(comment._id)
    .populate("owner", "username avatar fullName");

  if (!createdComment) {
    throw new ApiError(500, "Failed to create comment");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdComment, "Comment added successfully"));
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const comments = await Comment.find({ video: videoId, parentComment: null })
    .populate("owner", "username avatar fullName")
    .populate({
      path: "replies",
      populate: { path: "owner", select: "username avatar fullName" }
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const totalComments = await Comment.countDocuments({ video: videoId, parentComment: null });

  return res.status(200).json(
    new ApiResponse(200, { comments, totalComments, page: parseInt(page) }, "Comments fetched successfully")
  );
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId) {
    throw new ApiError(400, "Comment id is required");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Content is required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  comment.content = content;
  await comment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Comment id is required");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  await Comment.findByIdAndDelete(commentId);
  await Comment.deleteMany({ parentComment: commentId });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { addComment, getVideoComments, updateComment, deleteComment };
