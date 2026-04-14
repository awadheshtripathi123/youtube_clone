import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema({
  content: {
    type: String,
    required: true,
    maxLength: 280,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

tweetSchema.index({ owner: 1, createdAt: -1 });

export const Tweet = mongoose.model("Tweet", tweetSchema);