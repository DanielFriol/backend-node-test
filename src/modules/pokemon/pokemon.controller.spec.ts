import { Test, TestingModule } from '@nestjs/testing';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';
import { CreatePokemonDto } from './dtos/create-pokemon.dto';
import { UpdatePokemonDto } from './dtos/update-pokemon.dto';
import { FindManyPokemonsQueryDto } from './dtos/find-many-pokemons-query.dto';
import { ThrottlerModule } from '@nestjs/throttler';

const mockPokemonService = () => ({
  createOne: jest.fn(),
  findMany: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
  importFromPokeApi: jest.fn(),
});

describe('PokemonController', () => {
  let controller: PokemonController;
  let service: ReturnType<typeof mockPokemonService>;

  const mockPokemon = {
    id: 1,
    name: 'Pikachu',
    types: [{ name: 'ELECTRIC' }],
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonController],
      providers: [{ provide: PokemonService, useFactory: mockPokemonService }],
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 60,
            limit: 10,
          },
        ]),
      ],
    }).compile();

    controller = module.get<PokemonController>(PokemonController);
    service = module.get(PokemonService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOne', () => {
    it('should create a pokemon', async () => {
      const dto: CreatePokemonDto = {
        name: 'Pikachu',
        types: ['ELECTRIC'],
      };
      service.createOne.mockResolvedValue(mockPokemon);

      const result = await controller.createOne(dto);

      expect(service.createOne).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockPokemon);
    });
  });

  describe('findMany', () => {
    it('should find many pokemons', async () => {
      const query: FindManyPokemonsQueryDto = { page: 1, limit: 10 };
      const response = { total: 1, data: [mockPokemon] };
      service.findMany.mockResolvedValue(response);

      const result = await controller.findMany(query);

      expect(service.findMany).toHaveBeenCalledWith(query);
      expect(result).toEqual(response);
    });
  });

  describe('updateOne', () => {
    it('should update a pokemon', async () => {
      const dto: UpdatePokemonDto = { name: 'Raichu' };
      const updatedPokemon = { ...mockPokemon, ...dto };
      service.updateOne.mockResolvedValue(updatedPokemon);

      const result = await controller.updateOne(1, dto);

      expect(service.updateOne).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updatedPokemon);
    });
  });

  describe('deleteOne', () => {
    it('should delete a pokemon', async () => {
      service.deleteOne.mockResolvedValue(undefined);

      await controller.deleteOne(1);

      expect(service.deleteOne).toHaveBeenCalledWith(1);
    });
  });

  describe('importFromPokeApi', () => {
    it('should import a pokemon from PokeAPI', async () => {
      service.importFromPokeApi.mockResolvedValue(mockPokemon);

      const result = await controller.importFromPokeApi(1);

      expect(service.importFromPokeApi).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPokemon);
    });
  });
});
