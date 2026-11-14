import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/campus_connect";

    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Could not connect to MongoDB: ${error.message}`);
    console.info("[Database Tip] Verify that MongoDB is running locally or provide a valid MONGODB_URI in backend/.env");
    throw error;
  }
};

export default connectDB;
