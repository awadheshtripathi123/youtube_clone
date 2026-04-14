import { Router } from "express";
import {
  toggleSubscription,
  getUserSubscriptions,
  getChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.js";
import { verifyJWT } from "../middlewares/authentication.js";

const router = Router();

router.route("/subscribe/:channelId").post(verifyJWT, toggleSubscription);
router.route("/subscriptions").get(verifyJWT, getUserSubscriptions);
router.route("/subscribers/:channelId").get(verifyJWT, getChannelSubscribers);
router.route("/channels/:userId").get(verifyJWT, getSubscribedChannels);

export { router as subscriptionRouter };