import mongoose from "mongoose";
import { config } from "dotenv";

config();
const connectToDB = async () => {
    try {
        const uri = process.env.MONGO_URI as string;
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error : any) {
        console.log(`Error: ${error.message}`);
    }
}

export default connectToDB;