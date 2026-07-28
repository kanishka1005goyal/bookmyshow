import Redis from "ioredis";

// Single shared connection, reused across the seat-lock service (and anywhere
// else that needs Redis). REDIS_URL falls back to a local default so `npm run
// dev` works out of the box against `redis-server` on the default port.
const REDIS_URL = (process.env.REDIS_URL || "redis://127.0.0.1:6379").trim();

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error", err.message));

export default redis;
