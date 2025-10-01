"""
Caching utilities with Redis support and in-memory fallback
"""
import json
import time
import hashlib
from typing import Any, Optional, Union
from abc import ABC, abstractmethod

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class CacheBackend(ABC):
    """Abstract base class for cache backends"""

    @abstractmethod
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        pass

    @abstractmethod
    async def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """Set value in cache with optional TTL"""
        pass

    @abstractmethod
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        pass

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        pass

    @abstractmethod
    async def clear(self) -> bool:
        """Clear all cache entries"""
        pass


class InMemoryCache(CacheBackend):
    """In-memory cache implementation with TTL support"""

    def __init__(self):
        self._cache = {}
        self._expiry = {}

    def _is_expired(self, key: str) -> bool:
        """Check if cache entry is expired"""
        if key not in self._expiry:
            return False
        return time.time() > self._expiry[key]

    def _cleanup_expired(self):
        """Remove expired entries"""
        current_time = time.time()
        expired_keys = [
            key for key, expiry_time in self._expiry.items()
            if current_time > expiry_time
        ]
        for key in expired_keys:
            self._cache.pop(key, None)
            self._expiry.pop(key, None)

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        self._cleanup_expired()

        if key in self._cache and not self._is_expired(key):
            logger.debug(f"Cache hit for key: {key}")
            return self._cache[key]

        logger.debug(f"Cache miss for key: {key}")
        return None

    async def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """Set value in cache with optional TTL"""
        try:
            self._cache[key] = value

            if ttl:
                self._expiry[key] = time.time() + ttl
            elif key in self._expiry:
                del self._expiry[key]

            logger.debug(f"Cache set for key: {key}, TTL: {ttl}")
            return True
        except Exception as e:
            logger.error(f"Failed to set cache for key {key}: {str(e)}")
            return False

    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            self._cache.pop(key, None)
            self._expiry.pop(key, None)
            logger.debug(f"Cache deleted for key: {key}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete cache for key {key}: {str(e)}")
            return False

    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        self._cleanup_expired()
        return key in self._cache and not self._is_expired(key)

    async def clear(self) -> bool:
        """Clear all cache entries"""
        try:
            self._cache.clear()
            self._expiry.clear()
            logger.info("Cache cleared")
            return True
        except Exception as e:
            logger.error(f"Failed to clear cache: {str(e)}")
            return False


class RedisCache(CacheBackend):
    """Redis cache implementation"""

    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self._redis = None

    async def _get_redis(self):
        """Get Redis connection (lazy initialization)"""
        if self._redis is None:
            try:
                import redis.asyncio as redis
                self._redis = redis.from_url(self.redis_url, decode_responses=True)
                await self._redis.ping()
                logger.info("Redis connection established")
            except Exception as e:
                logger.error(f"Failed to connect to Redis: {str(e)}")
                raise
        return self._redis

    async def get(self, key: str) -> Optional[Any]:
        """Get value from Redis cache"""
        try:
            redis_client = await self._get_redis()
            value = await redis_client.get(key)

            if value is not None:
                logger.debug(f"Redis cache hit for key: {key}")
                return json.loads(value)

            logger.debug(f"Redis cache miss for key: {key}")
            return None
        except Exception as e:
            logger.error(f"Redis get error for key {key}: {str(e)}")
            return None

    async def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """Set value in Redis cache"""
        try:
            redis_client = await self._get_redis()
            serialized_value = json.dumps(value, default=str)

            if ttl:
                await redis_client.setex(key, ttl, serialized_value)
            else:
                await redis_client.set(key, serialized_value)

            logger.debug(f"Redis cache set for key: {key}, TTL: {ttl}")
            return True
        except Exception as e:
            logger.error(f"Redis set error for key {key}: {str(e)}")
            return False

    async def delete(self, key: str) -> bool:
        """Delete key from Redis cache"""
        try:
            redis_client = await self._get_redis()
            result = await redis_client.delete(key)
            logger.debug(f"Redis cache deleted for key: {key}")
            return result > 0
        except Exception as e:
            logger.error(f"Redis delete error for key {key}: {str(e)}")
            return False

    async def exists(self, key: str) -> bool:
        """Check if key exists in Redis cache"""
        try:
            redis_client = await self._get_redis()
            return await redis_client.exists(key) > 0
        except Exception as e:
            logger.error(f"Redis exists error for key {key}: {str(e)}")
            return False

    async def clear(self) -> bool:
        """Clear all Redis cache entries"""
        try:
            redis_client = await self._get_redis()
            await redis_client.flushdb()
            logger.info("Redis cache cleared")
            return True
        except Exception as e:
            logger.error(f"Redis clear error: {str(e)}")
            return False


class CacheManager:
    """Main cache manager with automatic backend selection"""

    def __init__(self):
        self.backend: CacheBackend = self._get_backend()
        self.default_ttl = settings.cache_ttl

    def _get_backend(self) -> CacheBackend:
        """Get appropriate cache backend"""
        if settings.redis_url:
            try:
                return RedisCache(settings.redis_url)
            except Exception as e:
                logger.warning(f"Failed to initialize Redis cache, falling back to in-memory: {str(e)}")

        logger.info("Using in-memory cache backend")
        return InMemoryCache()

    def generate_cache_key(self, prefix: str, **kwargs) -> str:
        """
        Generate cache key from prefix and parameters

        Args:
            prefix: Key prefix (e.g., 'attendance', 'cgpa')
            **kwargs: Parameters to include in key

        Returns:
            Generated cache key
        """
        # Sort kwargs for consistent key generation
        sorted_params = sorted(kwargs.items())
        params_str = json.dumps(sorted_params, separators=(',', ':'))

        # Create hash of parameters for shorter keys
        params_hash = hashlib.md5(params_str.encode()).hexdigest()[:8]

        return f"nimora:{prefix}:{params_hash}"

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        return await self.backend.get(key)

    async def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """Set value in cache"""
        if ttl is None:
            ttl = self.default_ttl
        return await self.backend.set(key, value, ttl)

    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        return await self.backend.delete(key)

    async def exists(self, key: str) -> bool:
        """Check if key exists"""
        return await self.backend.exists(key)

    async def clear(self) -> bool:
        """Clear all cache"""
        return await self.backend.clear()

    async def get_or_set(self, key: str, factory_func, ttl: int = None) -> Any:
        """
        Get value from cache or set it using factory function

        Args:
            key: Cache key
            factory_func: Async function to generate value if not in cache
            ttl: Time to live for cache entry

        Returns:
            Cached or newly generated value
        """
        # Try to get from cache first
        cached_value = await self.get(key)
        if cached_value is not None:
            return cached_value

        # Generate new value
        try:
            new_value = await factory_func()
            await self.set(key, new_value, ttl)
            return new_value
        except Exception as e:
            logger.error(f"Failed to generate value for cache key {key}: {str(e)}")
            raise


# Global cache manager instance
cache_manager = CacheManager()


def cache_key_for_user_data(rollno: str, data_type: str) -> str:
    """Generate cache key for user-specific data"""
    return cache_manager.generate_cache_key(
        prefix=data_type,
        rollno=rollno,
        date=time.strftime("%Y-%m-%d")  # Daily cache invalidation
    )
