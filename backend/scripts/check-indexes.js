import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function checkIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const likesCollection = db.collection("likes");
    const indexes = await likesCollection.indexes();
    console.log(JSON.stringify(indexes, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Error connecting to db or getting indexes:", error);
    process.exit(1);
  }
}

checkIndexes();
