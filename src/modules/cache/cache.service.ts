import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private cachedKeys: Set<string> = new Set();

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    return this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
    await this.cacheManager.set(key, value, ttlSeconds);
    this.cachedKeys.add(key);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
    this.cachedKeys.delete(key);
  }

  async clearByPrefix(prefix: string): Promise<void> {
    const keysToClear = Array.from(this.cachedKeys).filter((key) =>
      key.startsWith(prefix),
    );

    await Promise.all(keysToClear.map((key) => this.cacheManager.del(key)));

    keysToClear.forEach((key) => this.cachedKeys.delete(key));
  }
}
