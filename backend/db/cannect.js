import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log(
      `MongoDB Connected Successfully: ${connection.connection.host}`
    );

    return connection;
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);

    throw error;
  }
};

export default connectDB;