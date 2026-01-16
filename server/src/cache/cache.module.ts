import { Global, Module, Logger } from "@nestjs/common";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as redisStore from "cache-manager-redis-yet";
import { NimoraCacheService } from "./cache.service";

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>("REDIS_URL");
        const ttl = parseInt(configService.get("CACHE_TTL"), 10);
        const max = parseInt(configService.get("CACHE_MAX_ITEMS"), 10);
        const logger = new Logger("CacheModule");

        // Use Redis if URL is provided, otherwise in-memory cache
        if (redisUrl) {
          logger.log("Initializing Redis cache");
          return {
            store: redisStore,
            url: redisUrl,
            ttl,
          };
        }

        logger.log("Initializing in-memory cache (Redis not configured)");
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
