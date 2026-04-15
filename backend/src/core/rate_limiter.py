from fastapi_limiter import FastAPILimiter
import redis.asyncio as redis

redis_client = None


async def init_rate_limiter():
    global redis_client
    redis_client = redis.from_url(
        "redis://localhost:6379",
        encoding="utf8",
        decode_responses=True
    )
    await FastAPILimiter.init(redis_client)

