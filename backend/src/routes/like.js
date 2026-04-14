import { Router } from "express";
import {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
} from "../controllers/like.js";
import { verifyJWT } from "../middlewares/authentication.js";

const router = Router();

router.route("/video/:videoId").post(verifyJWT, toggleVideoLike);
router.route("/comment/:commentId").post(verifyJWT, toggleCommentLike);
router.route("/tweet/:tweetId").post(verifyJWT, toggleTweetLike);
router.route("/videos").get(verifyJWT, getLikedVideos);

export { router as likeRouter };
