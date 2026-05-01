import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  try {
    const uri = env.mongoUri.endsWith("/") ? env.mongoUri.slice(0, -1) : env.mongoUri;
    const fullUri = `${uri}/${env.mongoDb}?authSource=admin`;
    
    await mongoose.connect(fullUri);
    console.log(`[MongoDB] Connected to database: ${env.mongoDb}`);
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    process.exit(1);
  }
}
