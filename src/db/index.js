import mongoose from "mongoose";
import { DB_NAME } from "../contants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `\n MONGODB is connected!! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error(`MONGODB Connection FAILED: ${error}`);
    process.exit(1);
    throw error;
  }
};

export default connectDB;
