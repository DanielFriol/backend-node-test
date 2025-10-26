import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';

@Module({
  exports: [CacheService],
  providers: [CacheService],
})
export class CustomCacheModule {}
