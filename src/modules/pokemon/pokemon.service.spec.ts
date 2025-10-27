import { Test, TestingModule } from '@nestjs/testing';
import { PokemonService } from './pokemon.service';
import { PokemonRepository } from './pokemon.repository';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { TypeService } from '../type/type.service';
import { CacheService } from '../cache/cache.service';
import {
  NotFoundException,
  BadGatewayException,
  InternalServerErrorException,
} from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

const mockRepository = () => ({
  createOne: jest.fn(),
  findMany: jest.fn(),
  findOneById: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  upsertOne: jest.fn(),
});

const mockHttpService = () => ({ get: jest.fn() });
const mockConfigService = () => ({ get: jest.fn() });
const mockTypeService = () => ({
  findManyByNames: jest.fn(),
  upsertTypes: jest.fn(),
});
const mockCacheService = () => ({
  get: jest.fn(),
  set: jest.fn(),
  clearByPrefix: jest.fn(),
});

describe('PokemonService', () => {
  let service: PokemonService;
  let repository: ReturnType<typeof mockRepository>;
  let cacheService: ReturnType<typeof mockCacheService>;
  let httpService: ReturnType<typeof mockHttpService>;
  let configService: ReturnType<typeof mockConfigService>;
  let typeService: ReturnType<typeof mockTypeService>;

  const mockPokemon = {
    id: 1,
    name: 'Pikachu',
    types: [{ name: 'ELECTRIC' }],
    created_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonService,
        { provide: PokemonRepository, useFactory: mockRepository },
        { provide: HttpService, useFactory: mockHttpService },
        { provide: ConfigService, useFactory: mockConfigService },
        { provide: TypeService, useFactory: mockTypeService },
        { provide: CacheService, useFactory: mockCacheService },
      ],
    }).compile();

    service = module.get(PokemonService);
    repository = module.get(PokemonRepository);
    cacheService = module.get(CacheService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
    typeService = module.get(TypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOne', () => {
    it('should create a pokemon and clear the cache', async () => {
      const createDto = { name: 'Pikachu', types: ['ELECTRIC'] };
      repository.createOne.mockResolvedValue(mockPokemon);

      const result = await service.createOne(createDto);

      expect(repository.createOne).toHaveBeenCalledWith(createDto);
      expect(cacheService.clearByPrefix).toHaveBeenCalledWith('pokemons:list');
      expect(result).toEqual(mockPokemon);
    });
  });

  describe('findMany', () => {
    it('should return data from the cache if available', async () => {
      const query = { page: 1, limit: 10 };
      const cacheKey = `pokemons:list:${JSON.stringify(query)}`;
      cacheService.get.mockResolvedValue([mockPokemon]);

      const result = await service.findMany(query);

      expect(cacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(repository.findMany).not.toHaveBeenCalled();
      expect(result).toEqual([mockPokemon]);
    });

    it('should fetch from the repository if cache is empty', async () => {
      const query = { page: 1, limit: 10 };
      const cacheKey = `pokemons:list:${JSON.stringify(query)}`;
      const dbResult = { total: 1, data: [mockPokemon] };

      cacheService.get.mockResolvedValue(null);
      repository.findMany.mockResolvedValue(dbResult);

      const result = await service.findMany(query);

      expect(repository.findMany).toHaveBeenCalledWith(query);
      expect(cacheService.set).toHaveBeenCalledWith(cacheKey, dbResult);
      expect(result).toEqual(dbResult);
    });
  });

  describe('updateOne', () => {
    it('should update a pokemon successfully', async () => {
      const updateDto = { name: 'Raichu' };
      repository.findOneById.mockResolvedValue(mockPokemon);
      repository.updateOne.mockResolvedValue({
        ...mockPokemon,
        name: 'Raichu',
      });

      const result = await service.updateOne(1, updateDto);

      expect(repository.updateOne).toHaveBeenCalledWith(1, updateDto);
      expect(cacheService.clearByPrefix).toHaveBeenCalledWith('pokemons:list');
      expect(result.name).toBe('Raichu');
    });

    it('should throw NotFoundException if pokemon to update does not exist', async () => {
      repository.findOneById.mockResolvedValue(null);

      await expect(service.updateOne(99, { name: 'Ghost' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteOne', () => {
    it('should delete a pokemon and clear the cache', async () => {
      repository.findOneById.mockResolvedValue(mockPokemon);
      repository.deleteOne.mockResolvedValue(undefined);

      await service.deleteOne(1);

      expect(repository.deleteOne).toHaveBeenCalledWith(1);
      expect(cacheService.clearByPrefix).toHaveBeenCalledWith('pokemons:list');
    });

    it('should throw NotFoundException if pokemon to delete does not exist', async () => {
      repository.findOneById.mockResolvedValue(null);

      await expect(service.deleteOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('importFromPokeApi', () => {
    const pokeApiUrl = 'https://pokeapi.co/api/v2';

    beforeEach(() => {
      configService.get.mockReturnValue(pokeApiUrl);
    });

    it('should import a pokemon successfully', async () => {
      const pokeApiData = {
        name: 'pikachu',
        types: [{ type: { name: 'electric' } }],
        forms: [{ name: 'pikachu' }],
      };
      const createDto = { name: 'pikachu', types: ['ELECTRIC'] };
      httpService.get.mockReturnValue(
        of({ data: pokeApiData } as AxiosResponse),
      );
      repository.upsertOne.mockResolvedValue(mockPokemon);

      const result = await service.importFromPokeApi(1);

      expect(httpService.get).toHaveBeenCalledWith(`${pokeApiUrl}/pokemon/1`);
      expect(typeService.upsertTypes).toHaveBeenCalledWith(['ELECTRIC']);
      expect(repository.upsertOne).toHaveBeenCalledWith(1, createDto);
      expect(cacheService.clearByPrefix).toHaveBeenCalledWith('pokemons:list');
      expect(result).toEqual(mockPokemon);
    });

    it('should throw NotFoundException on PokeAPI 404 error', async () => {
      const axiosError = { response: { status: 404 }, isAxiosError: true };
      httpService.get.mockReturnValue(throwError(() => axiosError));

      await expect(service.importFromPokeApi(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadGatewayException on other PokeAPI errors', async () => {
      const axiosError = { response: { status: 500 }, isAxiosError: true };
      httpService.get.mockReturnValue(throwError(() => axiosError));

      await expect(service.importFromPokeApi(1)).rejects.toThrow(
        BadGatewayException,
      );
    });

    it('should throw InternalServerErrorException for non-axios errors', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new Error('Network Failure')),
      );

      await expect(service.importFromPokeApi(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
