import { Router } from "express";
import {
  createTweet,
  getUserTweets,
  getAllTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.js";
import { verifyJWT } from "../middlewares/authentication.js";
import { validate, createTweetSchema } from "../utils/validation.js";

const router = Router();

router.route("/").post(verifyJWT, validate(createTweetSchema), createTweet).get(getAllTweets);
router.route("/user/:userId").get(verifyJWT, getUserTweets);
router.route("/:tweetId").patch(verifyJWT, updateTweet).delete(verifyJWT, deleteTweet);

export { router as tweetRouter };
