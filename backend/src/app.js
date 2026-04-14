import express, { urlencoded } from "express"; 
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5000, 
  message: "Too many requests from this IP"
});

app.use(helmet());
app.use(limiter);

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use(express.json({limit: '500mb'}))
app.use(urlencoded({ extended: true, limit: '500mb'}))
app.use(express.static('public'))
app.use(cookieParser());

// Routes Import
import { userRouter } from "./routes/user.js";
import { videoRouter } from "./routes/video.js";
import { subscriptionRouter } from "./routes/subscription.js";
import { tweetRouter } from "./routes/tweet.js";
import { commentRouter } from "./routes/comment.js";
import { likeRouter } from "./routes/like.js";
import { playlistRouter } from "./routes/playlist.js";

// Routes Declaration as a Middleware
app.use("/api/v1/user", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlists", playlistRouter);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

export { app };
// Trigger restart