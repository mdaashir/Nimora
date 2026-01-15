import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NimoraCacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ttl: 60 * 1000, // 1 minute default
        max: 100, // Maximum number of items in cache
        // Redis configuration (optional - fallback to in-memory)
        // store: redisStore,
        // host: configService.get('REDIS_HOST'),
        // port: configService.get('REDIS_PORT'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [NimoraCacheService],
  exports: [NestCacheModule, NimoraCacheService],
})
export class CacheModule {}
