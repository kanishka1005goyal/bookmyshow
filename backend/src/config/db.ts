import mongoose from "mongoose";
import dns from "dns";

// Only override the system DNS resolver if explicitly opted into via env —
// forcing 8.8.8.8 process-wide breaks BOTH the Mongo SRV lookup and Redis's
// hostname resolution on networks that block public DNS resolvers (common on
// college/office WiFi). Leave DNS_SERVERS unset to just use the OS default.
if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(",").map((s) => s.trim()));
}

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection failed", err);
    process.exit(1);
  }
};