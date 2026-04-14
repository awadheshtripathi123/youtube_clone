import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  video: {
    type: Schema.Types.ObjectId,
    ref: "Video",
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
  },
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
}, { timestamps: true });

commentSchema.index({ video: 1, createdAt: -1 });
commentSchema.index({ owner: 1 });

export const Comment = mongoose.model("Comment", commentSchema);