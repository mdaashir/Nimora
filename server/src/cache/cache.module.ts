import { Global, Module, Logger } from "@nestjs/common";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import redisStore from "cache-manager-ioredis";
import { NimoraCacheService } from "./cache.service";

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>("REDIS_URL");
        const ttlStr = configService.get<string>("CACHE_TTL");
        const maxStr = configService.get<string>("CACHE_MAX_ITEMS");

        if (!ttlStr || !maxStr) {
          throw new Error("CACHE_TTL and CACHE_MAX_ITEMS must be configured");
        }

        const ttl = parseInt(ttlStr, 10);
        const max = parseInt(maxStr, 10);
        const logger = new Logger("CacheModule");

        // Use Redis if URL is provided, otherwise in-memory cache
        if (redisUrl) {
          logger.log("Initializing Redis cache from REDIS_URL");
          return {
            store: redisStore,
            url: redisUrl,
            ttl,
          };
        }

        logger.log(
          "Initializing in-memory cache (Redis not configured via REDIS_URL)",
        );
        return {
          ttl,
          max,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [NimoraCacheService],
  exports: [NestCacheModule, NimoraCacheService],
})
export class CacheModule {}
