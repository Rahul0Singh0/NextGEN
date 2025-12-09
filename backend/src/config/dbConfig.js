import mongoose from 'mongoose';
import { MONGO_URI } from './serverConfig.js';

const connectDB = async () => {
    console.log("Attempting to connect to MongoDB...");
    try {
        if (!MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

export default connectDB;