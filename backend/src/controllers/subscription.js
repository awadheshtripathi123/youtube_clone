import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel id is required");
  }

  if (req.user._id.toString() === channelId) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSubscription) {
    await Subscription.findByIdAndDelete(existingSubscription._id);
    return res
      .status(200)
      .json(new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully"));
  }

  const subscription = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (!subscription) {
    throw new ApiError(500, "Something went wrong while subscribing");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, { subscribed: true }, "Subscribed successfully"));
});

const getUserSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({ subscriber: req.user._id })
    .populate("channel", "username avatar fullName")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscriptions, "User subscriptions fetched successfully")
    );
});

const getChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "Channel id is required");
  }

  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "username avatar fullName")
    .sort({ createdAt: -1 });

  const subscriberCount = await Subscription.countDocuments({ channel: channelId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribers, subscriberCount },
        "Channel subscribers fetched successfully"
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  const subscriptions = await Subscription.find({ subscriber: userId })
    .populate("channel", "username avatar fullName");

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully")
    );
});

export {
  toggleSubscription,
  getUserSubscriptions,
  getChannelSubscribers,
  getSubscribedChannels,
};
