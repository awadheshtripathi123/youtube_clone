import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DB_NAME = 'youtube';

async function fixIndexes() {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log(`Connected to MongoDB. Database: ${mongoose.connection.db.databaseName}`);

    const db = mongoose.connection.db;
    const likesCollection = db.collection("likes");

    console.log("Dropping old indexes...");
    try { await likesCollection.dropIndex("user_1_video_1"); console.log("Dropped user_1_video_1"); } catch(e) { console.log("user_1_video_1 not found, skipping"); }
    try { await likesCollection.dropIndex("user_1_comment_1"); console.log("Dropped user_1_comment_1"); } catch(e) { console.log("user_1_comment_1 not found, skipping"); }
    try { await likesCollection.dropIndex("user_1_tweet_1"); console.log("Dropped user_1_tweet_1"); } catch(e) { console.log("user_1_tweet_1 not found, skipping"); }

    console.log("Indexes dropped successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error connecting to db or dropping indexes:", error);
    process.exit(1);
  }
}

fixIndexes();
