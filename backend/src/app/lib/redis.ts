import { createClient, RedisClientType } from "redis";
import { envVars } from "../config/env";

class RedisService {
    private client: RedisClientType | null = null;
    private isConnected: boolean = false;

    async connect(): Promise<void> {
        try {
            // Try to get Redis URL from environment variables
            const redisUrl = envVars.REDIS_URL;
            // console.log({ redisUrl });

            if (redisUrl) {
                this.client = createClient({ url: redisUrl });
            } else {
                // Fallback to individual parameters
                const host = process.env.REDIS_HOST || "localhost";
                const port = parseInt(process.env.REDIS_PORT || "6379", 10);
                const password = process.env.REDIS_PASSWORD || undefined;

                this.client = createClient({
                    socket: {
                        host,
                        port,
                    },
                    ...(password && { password }),
                });
            }

            // Handle connection events
            this.client.on("error", (err) => {
                console.error("Redis Client Error:", err);
                this.isConnected = false;
            });

            this.client.on("connect", () => {
                console.log("Redis Client Connected");
                this.isConnected = true;
            });

            this.client.on("ready", () => {
                console.log("Redis Client Ready");
                this.isConnected = true;
            });

            this.client.on("end", () => {
                console.log("Redis Client Disconnected");
                this.isConnected = false;
            });

            // Reconnect strategy
            this.client.on("reconnecting", () => {
                console.log("Redis Client Reconnecting");
            });

            await this.client.connect();
        } catch (error) {
            console.error("Failed to connect to Redis:", error);
            this.isConnected = false;
            // Don't throw here - we want the app to work even if Redis is unavailable
        }
    }

    private ensureConnection(): RedisClientType {
        if (!this.client) {
            throw new Error(
                "Redis client not initialized. Call connect() first.",
            );
        }
        if (!this.isConnected) {
            throw new Error("Redis client not connected.");
        }
        return this.client;
    }

    private memoryCacheStore = new Map<string, { value: string; expiry: number }>();

    private matchPattern(key: string, pattern: string): boolean {
        const regexPattern =
            "^" +
            pattern
                .replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&")
                .replace(/\*/g, ".*") +
            "$";
        return new RegExp(regexPattern).test(key);
    }

    clearMemoryCache(): void {
        this.memoryCacheStore.clear();
    }

    async get(key: string): Promise<string | null> {
        try {
            if (this.isConnected && this.client) {
                const result = await this.client.get(key);
                if (result !== null) {
                    return result;
                }
            }
        } catch (error) {
            console.warn("Redis GET error, falling back to memory:", error);
        }

        const mem = this.memoryCacheStore.get(key);
        if (mem) {
            if (Date.now() < mem.expiry) {
                return mem.value;
            } else {
                this.memoryCacheStore.delete(key);
            }
        }
        return null;
    }

    async set(key: string, value: unknown, ttlInSeconds: number): Promise<void> {
        const stringValue =
            typeof value === "string" ? value : JSON.stringify(value);

        this.memoryCacheStore.set(key, {
            value: stringValue,
            expiry: Date.now() + ttlInSeconds * 1000,
        });

        try {
            if (this.isConnected && this.client) {
                await this.client.set(key, stringValue, { EX: ttlInSeconds });
            }
        } catch (error) {
            console.warn("Redis SET error:", error);
        }
    }

    async update(key: string, value: unknown, ttlInSeconds: number): Promise<void> {
        await this.set(key, value, ttlInSeconds);
    }

    async delete(key: string): Promise<void> {
        this.memoryCacheStore.delete(key);
        try {
            if (this.isConnected && this.client) {
                await this.client.del(key);
            }
        } catch (error) {
            console.warn("Redis DELETE error:", error);
        }
    }

    async deleteByPattern(pattern: string): Promise<void> {
        for (const k of this.memoryCacheStore.keys()) {
            if (this.matchPattern(k, pattern)) {
                this.memoryCacheStore.delete(k);
            }
        }

        try {
            if (this.isConnected && this.client) {
                const keys = await this.client.keys(pattern);
                if (keys && keys.length > 0) {
                    await this.client.del(keys);
                }
            }
        } catch (error) {
            console.warn(`Redis deleteByPattern error for pattern ${pattern}:`, error);
        }
    }

    async withCache<T>(
        key: string,
        ttlSeconds: number,
        fetcher: () => Promise<T>
    ): Promise<T> {
        try {
            const cached = await this.get(key);
            if (cached !== null) {
                try {
                    return JSON.parse(cached) as T;
                } catch {
                    return cached as unknown as T;
                }
            }
        } catch (error) {
            console.warn(`Redis withCache GET error for key ${key}:`, error);
        }

        const freshData = await fetcher();

        try {
            if (freshData !== undefined && freshData !== null) {
                await this.set(key, freshData, ttlSeconds);
            }
        } catch (error) {
            console.warn(`Redis withCache SET error for key ${key}:`, error);
        }

        return freshData;
    }

    async isAvailable(): Promise<boolean> {
        try {
            if (this.client && this.isConnected) {
                await this.client.ping();
                return true;
            }
            return false;
        } catch (error) {
            console.warn("Redis ping failed:", error);
            return false;
        }
    }

    getClient(): RedisClientType | null {
        return this.client;
    }

    private memoryRateLimitStore: Map<string, number[]> = new Map();

    private evaluateMemoryRateLimit(
        key: string,
        limit: number,
        windowMs: number
    ): { allowed: boolean; remaining: number; retryAfter: number } {
        const now = Date.now();
        const clearBefore = now - windowMs;
        const timestamps = (this.memoryRateLimitStore.get(key) || []).filter(
            (ts) => ts > clearBefore
        );

        if (timestamps.length < limit) {
            timestamps.push(now);
            this.memoryRateLimitStore.set(key, timestamps);
            return {
                allowed: true,
                remaining: limit - timestamps.length,
                retryAfter: 0,
            };
        } else {
            const oldest = timestamps[0] || now;
            const retryAfter = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
            return {
                allowed: false,
                remaining: 0,
                retryAfter,
            };
        }
    }

    clearMemoryRateLimits(): void {
        this.memoryRateLimitStore.clear();
    }

    async evaluateRateLimit(
        key: string,
        limit: number,
        windowMs: number
    ): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
        try {
            if (!this.isConnected || !this.client) {
                return this.evaluateMemoryRateLimit(key, limit, windowMs);
            }
            const client = this.client;
            const now = Date.now();
            const member = `${now}:${Math.random().toString(36).substring(2, 8)}`;
            const script = `
                local key = KEYS[1]
                local now = tonumber(ARGV[1])
                local window = tonumber(ARGV[2])
                local limit = tonumber(ARGV[3])
                local member = ARGV[4]
                local clearBefore = now - window

                redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
                local currentCount = redis.call('ZCARD', key)

                if currentCount < limit then
                    redis.call('ZADD', key, now, member)
                    redis.call('EXPIRE', key, math.ceil(window / 1000))
                    return { 1, limit - (currentCount + 1), 0 }
                else
                    local oldestMembers = redis.call('ZRANGE', key, 0, 0)
                    local retryAfter = 1
                    if oldestMembers and #oldestMembers > 0 then
                        local oldestScore = tonumber(redis.call('ZSCORE', key, oldestMembers[1]))
                        if oldestScore then
                            retryAfter = math.ceil((oldestScore + window - now) / 1000)
                        end
                    end
                    if retryAfter <= 0 then retryAfter = 1 end
                    return { 0, 0, retryAfter }
                end
            `;

            const reply = (await client.eval(script, {
                keys: [key],
                arguments: [String(now), String(windowMs), String(limit), member],
            })) as unknown;

            if (Array.isArray(reply)) {
                const allowed = Number(reply[0]) === 1;
                const remaining = Number(reply[1]);
                const retryAfter = Number(reply[2]);
                return { allowed, remaining, retryAfter };
            }

            return this.evaluateMemoryRateLimit(key, limit, windowMs);
        } catch (error) {
            console.error("Redis rate limit evaluation error, falling back to in-memory:", error);
            return this.evaluateMemoryRateLimit(key, limit, windowMs);
        }
    }

    async disconnect(): Promise<void> {
        if (this.client && this.isConnected) {
            await this.client.quit();
            this.isConnected = false;
        }
    }
}

// Export a singleton instance
export const redisService = new RedisService();

/**
 * Generates a deterministic, URL-safe base64url hash from query parameters.
 */
export const computeQueryHash = (query: Record<string, unknown> = {}): string => {
    const keys = Object.keys(query)
        .filter((k) => query[k] !== undefined && query[k] !== null && query[k] !== "")
        .sort();
    if (keys.length === 0) return "all";
    const sortedObj: Record<string, unknown> = {};
    for (const k of keys) {
        sortedObj[k] = query[k];
    }
    return Buffer.from(JSON.stringify(sortedObj)).toString("base64url");
};

