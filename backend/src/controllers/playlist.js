import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, isPublic } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Name is required");
  }

  const playlist = await Playlist.create({
    name,
    description: description || "",
    owner: req.user._id,
    isPublic: isPublic ?? true,
  });

  const createdPlaylist = await Playlist.findById(playlist._id);

  if (!createdPlaylist) {
    throw new ApiError(500, "Failed to create playlist");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdPlaylist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  const playlists = await Playlist.find({ owner: userId })
    .populate("videos", "thumbnail title duration views")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
});

const getMyPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({ owner: req.user._id })
    .populate("videos", "thumbnail title duration views")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "My playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "Playlist id is required");
  }

  const playlist = await Playlist.findById(playlistId)
    .populate("videos")
    .populate("owner", "username avatar fullName");

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (!playlist.isPublic && playlist.owner._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "This playlist is private");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { videoId } = req.body;

  if (!playlistId) {
    throw new ApiError(400, "Playlist id is required");
  }

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to modify this playlist");
  }

  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already in playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { videoId } = req.body;

  if (!playlistId) {
    throw new ApiError(400, "Playlist id is required");
  }

  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to modify this playlist");
  }

  playlist.videos = playlist.videos.filter(
    (id) => id.toString() !== videoId
  );
  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video removed from playlist successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new ApiError(400, "Playlist id is required");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this playlist");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description, isPublic } = req.body;

  if (!playlistId) {
    throw new ApiError(400, "Playlist id is required");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this playlist");
  }

  if (name) playlist.name = name;
  if (description !== undefined) playlist.description = description;
  if (isPublic !== undefined) playlist.isPublic = isPublic;

  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getMyPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
