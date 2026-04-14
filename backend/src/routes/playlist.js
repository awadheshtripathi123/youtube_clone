import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylists,
  getMyPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.js";
import { verifyJWT } from "../middlewares/authentication.js";
import { validate, createPlaylistSchema, updatePlaylistSchema, addVideoToPlaylistSchema } from "../utils/validation.js";

const router = Router();

router.route("/").post(verifyJWT, validate(createPlaylistSchema), createPlaylist).get(verifyJWT, getMyPlaylists);
router.route("/user/:userId").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById)
  .patch(verifyJWT, validate(updatePlaylistSchema), updatePlaylist)
  .delete(verifyJWT, deletePlaylist);
router.route("/:playlistId/add-video").patch(verifyJWT, validate(addVideoToPlaylistSchema), addVideoToPlaylist);
router.route("/:playlistId/remove-video").patch(verifyJWT, validate(addVideoToPlaylistSchema), removeVideoFromPlaylist);

export { router as playlistRouter };
