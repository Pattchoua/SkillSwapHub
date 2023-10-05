import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_CONNECTION_STRING)
    return console.log("Missing MONGODB_CONNECTION_STRING");

  if (isConnected) {
    return console.log("MongoDb sucessfull connected");
  }

  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
      dbName: "SkillSwapHub",
    });

    isConnected = true;
    console.log("MongoDB is connected");
  } catch (error) {
    console.log("MongoDB connection failed", error);
  }
};
