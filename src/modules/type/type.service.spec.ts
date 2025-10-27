import { Test, TestingModule } from '@nestjs/testing';
import { TypeService } from './type.service';
import { TypeRepository } from './type.repository';
import { CacheService } from '../cache/cache.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockTypeRepository = () => ({
  findAll: jest.fn(),
  findOneByName: jest.fn(),
  createOne: jest.fn(),
  findOneById: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  findManyByNames: jest.fn(),
  upsertTypes: jest.fn(),
});

const mockCacheService = () => ({
  get: jest.fn(),
  set: jest.fn(),
  clearByPrefix: jest.fn(),
});

describe('TypeService', () => {
  let service: TypeService;
  let repository: ReturnType<typeof mockTypeRepository>;
  let cacheService: ReturnType<typeof mockCacheService>;

  const mockType = { id: 1, name: 'GRASS' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeService,
        { provide: TypeRepository, useFactory: mockTypeRepository },
        { provide: CacheService, useFactory: mockCacheService },
      ],
    }).compile();

    service = module.get<TypeService>(TypeService);
    repository = module.get(TypeRepository);
    cacheService = module.get(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return cached types if available', async () => {
      cacheService.get.mockResolvedValue([mockType]);
      const result = await service.findAll();
      expect(result).toEqual([mockType]);
      expect(repository.findAll).not.toHaveBeenCalled();
    });

    it('should fetch types from repository and cache them if not cached', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.findAll.mockResolvedValue([mockType]);
      const result = await service.findAll();
      expect(result).toEqual([mockType]);
      expect(cacheService.set).toHaveBeenCalledWith('types:list', [mockType]);
    });
  });

  describe('createOne', () => {
    it('should create a type', async () => {
      repository.findOneByName.mockResolvedValue(null);
      repository.createOne.mockResolvedValue(mockType);
      const result = await service.createOne('GRASS');
      expect(result).toEqual(mockType);
      expect(cacheService.clearByPrefix).toHaveBeenCalledWith('types:list');
    });

    it('should throw BadRequestException if type already exists', async () => {
      repository.findOneByName.mockResolvedValue(mockType);
      await expect(service.createOne('GRASS')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateOne', () => {
    it('should update a type', async () => {
      repository.findOneById.mockResolvedValue(mockType);
      repository.findOneByName.mockResolvedValue(null);
      repository.updateOne.mockResolvedValue({ ...mockType, name: 'POISON' });
      const result = await service.updateOne(1, 'POISON');
      expect(result.name).toEqual('POISON');
      expect(cacheService.clearByPrefix).toHaveBeenCalledWith('types:list');
    });

    it('should throw NotFoundException if type not found', async () => {
      repository.findOneById.mockResolvedValue(null);
      await expect(service.updateOne(1, 'POISON')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if name already exists for another type', async () => {
      repository.findOneById.mockResolvedValue(mockType);
      repository.findOneByName.mockResolvedValue({ id: 2, name: 'POISON' });
      await expect(service.updateOne(1, 'POISON')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteOne', () => {
    it('should delete a type', async () => {
      repository.findOneById.mockResolvedValue(mockType);
      await service.deleteOne(1);
      expect(repository.deleteOne).toHaveBeenCalledWith(1);
      expect(cacheService.clearByPrefix).toHaveBeenCalledWith('types:list');
    });

    it('should throw NotFoundException if type not found', async () => {
      repository.findOneById.mockResolvedValue(null);
      await expect(service.deleteOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findManyByNames', () => {
    it('should return types for given names', async () => {
      repository.findManyByNames.mockResolvedValue([mockType]);
      const result = await service.findManyByNames(['GRASS']);
      expect(result).toEqual([mockType]);
    });

    it('should throw NotFoundException if any type is not found', async () => {
      repository.findManyByNames.mockResolvedValue([]);
      await expect(service.findManyByNames(['GRASS'])).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('upsertTypes', () => {
    it('should upsert types', async () => {
      await service.upsertTypes(['GRASS']);
      expect(repository.upsertTypes).toHaveBeenCalledWith(['GRASS']);
      expect(cacheService.clearByPrefix).toHaveBeenCalledWith('types:list');
    });
  });
});
