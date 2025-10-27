import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: typeof mockCacheManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should get a value from cache', async () => {
      cacheManager.get.mockResolvedValue('value');
      const result = await service.get('key');
      expect(result).toEqual('value');
    });
  });

  describe('set', () => {
    it('should set a value in cache', async () => {
      await service.set('key', 'value');
      expect(cacheManager.set).toHaveBeenCalledWith('key', 'value', 60);
    });
  });

  describe('del', () => {
    it('should delete a value from cache', async () => {
      await service.del('key');
      expect(cacheManager.del).toHaveBeenCalledWith('key');
    });
  });

  describe('clearByPrefix', () => {
    it('should clear keys with a given prefix', async () => {
      await service.set('prefix:key1', 'value1');
      await service.set('prefix:key2', 'value2');
      await service.set('other:key3', 'value3');

      await service.clearByPrefix('prefix');

      expect(cacheManager.del).toHaveBeenCalledWith('prefix:key1');
      expect(cacheManager.del).toHaveBeenCalledWith('prefix:key2');
      expect(cacheManager.del).not.toHaveBeenCalledWith('other:key3');
    });
  });
});
