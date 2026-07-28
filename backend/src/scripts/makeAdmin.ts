import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "dns";
import User from "../models/user";

dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);

  const result = await User.findOneAndUpdate(
    { email: "test@example.com" },
    { role: "admin" },
    { new: true }
  );

  console.log("Updated user:", result);
  await mongoose.disconnect();
}

run();
