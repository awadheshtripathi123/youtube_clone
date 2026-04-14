import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  videos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  isPublic: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

playlistSchema.index({ owner: 1, createdAt: -1 });
playlistSchema.index({ isPublic: 1 });

export const Playlist = mongoose.model("Playlist", playlistSchema);