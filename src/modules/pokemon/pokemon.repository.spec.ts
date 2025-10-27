import { Test, TestingModule } from '@nestjs/testing';
import { PokemonRepository } from './pokemon.repository';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePokemonDto } from './dtos/create-pokemon.dto';
import { UpdatePokemonDto } from './dtos/update-pokemon.dto';
import { FindManyPokemonsQueryDto } from './dtos/find-many-pokemons-query.dto';

const mockPrismaService = () => ({
  pokemon: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
  },
  $transaction: jest.fn(),
});

describe('PokemonRepository', () => {
  let repository: PokemonRepository;
  let prisma: ReturnType<typeof mockPrismaService>;

  const mockPokemon = {
    id: 1,
    name: 'Pikachu',
    types: [{ name: 'ELECTRIC' }],
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonRepository,
        { provide: PrismaService, useFactory: mockPrismaService },
      ],
    }).compile();

    repository = module.get<PokemonRepository>(PokemonRepository);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('createOne', () => {
    it('should create a pokemon', async () => {
      const dto: CreatePokemonDto = {
        name: 'Pikachu',
        types: ['ELECTRIC'],
      };
      prisma.pokemon.create.mockResolvedValue(mockPokemon);

      const result = await repository.createOne(dto);

      expect(prisma.pokemon.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          types: {
            connect: dto.types.map((type) => ({ name: type })),
          },
        },
        include: {
          types: {
            select: {
              name: true,
            },
          },
        },
      });
      expect(result).toEqual(mockPokemon);
    });
  });

  describe('findMany', () => {
    it('should find many pokemons', async () => {
      const query: FindManyPokemonsQueryDto = { page: 1, limit: 10 };
      prisma.$transaction.mockResolvedValue([1, [mockPokemon]]);

      const result = await repository.findMany(query);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual({ total: 1, data: [mockPokemon] });
    });

    it('should find many pokemons with all query params', async () => {
      const query: FindManyPokemonsQueryDto = {
        page: 1,
        limit: 10,
        name: 'pika',
        order: 'asc',
        type: 'electric',
      };
      prisma.$transaction.mockResolvedValue([1, [mockPokemon]]);

      const result = await repository.findMany(query);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual({ total: 1, data: [mockPokemon] });
    });
  });

  describe('updateOne', () => {
    it('should update a pokemon', async () => {
      const dto: UpdatePokemonDto = { name: 'Raichu', types: ['ELECTRIC'] };
      const updatedPokemon = { ...mockPokemon, ...dto };
      prisma.pokemon.update.mockResolvedValue(updatedPokemon);

      const result = await repository.updateOne(1, dto);

      expect(prisma.pokemon.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: dto.name,
          types: {
            set: dto.types.map((type) => ({ name: type })),
          },
        },
        include: {
          types: {
            select: {
              name: true,
            },
          },
        },
      });
      expect(result).toEqual(updatedPokemon);
    });

    it('should update a pokemon without types', async () => {
      const dto: UpdatePokemonDto = { name: 'Raichu' };
      const updatedPokemon = { ...mockPokemon, ...dto };
      prisma.pokemon.update.mockResolvedValue(updatedPokemon);

      const result = await repository.updateOne(1, dto);

      expect(prisma.pokemon.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: dto.name,
          types: undefined,
        },
        include: {
          types: {
            select: {
              name: true,
            },
          },
        },
      });
      expect(result).toEqual(updatedPokemon);
    });
  });

  describe('findOneById', () => {
    it('should find a pokemon by id', async () => {
      prisma.pokemon.findUnique.mockResolvedValue(mockPokemon);

      const result = await repository.findOneById(1);

      expect(prisma.pokemon.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockPokemon);
    });
  });

  describe('deleteOne', () => {
    it('should delete a pokemon', async () => {
      prisma.pokemon.delete.mockResolvedValue(undefined);

      await repository.deleteOne(1);

      expect(prisma.pokemon.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('upsertOne', () => {
    it('should upsert a pokemon', async () => {
      const dto: CreatePokemonDto = {
        name: 'Pikachu',
        types: ['ELECTRIC'],
      };
      prisma.pokemon.upsert.mockResolvedValue(mockPokemon);

      const result = await repository.upsertOne(1, dto);

      expect(prisma.pokemon.upsert).toHaveBeenCalled();
      expect(result).toEqual(mockPokemon);
    });

    it('should upsert a pokemon without types', async () => {
      const dto: CreatePokemonDto = {
        name: 'Pikachu',
        types: [],
      };
      prisma.pokemon.upsert.mockResolvedValue(mockPokemon);

      const result = await repository.upsertOne(1, dto);

      expect(prisma.pokemon.upsert).toHaveBeenCalled();
      expect(result).toEqual(mockPokemon);
    });
  });
});
