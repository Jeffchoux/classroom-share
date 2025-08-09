import { Redis } from "@upstash/redis";
export const kv = Redis.fromEnv(); // requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
