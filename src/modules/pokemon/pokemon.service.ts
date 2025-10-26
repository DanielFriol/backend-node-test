import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PokemonRepository } from './pokemon.repository';
import { CreatePokemonDto } from './dtos/create-pokemon.dto';
import { Pokemon } from '@prisma/client';
import { FindManyPokemonsQueryDto } from './dtos/find-many-pokemons-query.dto';
import { PaginationResponse } from '../commons/pagination.response';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';
import { TypeService } from '../type/type.service';
import { CacheService } from '../cache/cache.service';

const POKEMON_CACHE_LIST_KEY = 'pokemons:list';

@Injectable()
export class PokemonService {
  constructor(
    private readonly pokemonsRepository: PokemonRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly typeService: TypeService,
    private readonly cacheService: CacheService,
  ) {}

  async createOne(data: CreatePokemonDto): Promise<Pokemon> {
    await this.typeService.findManyByNames(data.types);
    const pokemon = await this.pokemonsRepository.createOne(data);
    await this.cacheService.clearByPrefix(POKEMON_CACHE_LIST_KEY);
    return pokemon;
  }

  async findMany(
    query: FindManyPokemonsQueryDto,
  ): Promise<PaginationResponse<Pokemon>> {
    const cacheKey = `${POKEMON_CACHE_LIST_KEY}:${JSON.stringify(query)}`;
    const cached =
      await this.cacheService.get<PaginationResponse<Pokemon>>(cacheKey);
    if (cached) {
      return cached;
    }

    const pokemons = await this.pokemonsRepository.findMany(query);
    await this.cacheService.set(cacheKey, pokemons);

    return pokemons;
  }

  async updateOne(
    id: number,
    data: Partial<CreatePokemonDto>,
  ): Promise<Pokemon> {
    await this.typeService.findManyByNames(data.types);
    await this.checkIfPokemonExists(id);

    const updatedPokemon = await this.pokemonsRepository.updateOne(id, data);
    await this.cacheService.clearByPrefix(POKEMON_CACHE_LIST_KEY);
    return updatedPokemon;
  }

  private async checkIfPokemonExists(id: number) {
    const existingPokemon = await this.pokemonsRepository.findOneById(id);

    if (!existingPokemon) {
      throw new NotFoundException('Pokémon não encontrado.');
    }
  }

  async deleteOne(id: number): Promise<void> {
    await this.checkIfPokemonExists(id);
    this.pokemonsRepository.deleteOne(id);
    await this.cacheService.clearByPrefix(POKEMON_CACHE_LIST_KEY);
  }

  private async getFromPokeApi(id: number): Promise<CreatePokemonDto> {
    const baseUrl = this.configService.get<string>('POKE_API_URL');

    const pokeApiUrl = `${baseUrl}/pokemon/${id}`;

    try {
      const response = await firstValueFrom(this.httpService.get(pokeApiUrl));
      const pokeData = response.data;

      const types = pokeData.types.map((type) => type.type.name.toUpperCase());

      const createPokemonDto: CreatePokemonDto = {
        // Considering here just the one name for simplicity
        name: pokeData.forms.at(0).name,
        types: types,
      };

      return createPokemonDto;
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new NotFoundException(
            `Pokémon com o ID #${id} não foi encontrado na api externa PokeAPI.`,
          );
        }
        throw new BadGatewayException(
          'Falha ao se comunicar com a PokeAPI. A API externa pode não estar disponível no momento.',
        );
      }

      throw new InternalServerErrorException(
        'Ocorreu um erro inesperado ao tentar importar o Pokémon da PokeAPI.',
      );
    }
  }

  async importFromPokeApi(id: number): Promise<Pokemon> {
    const createPokemonDto = await this.getFromPokeApi(id);
    // Create the types in the database if they don't exist to successfully import the pokemon
    await this.typeService.upsertTypes(createPokemonDto.types);

    const pokemon = await this.pokemonsRepository.upsertOne(
      id,
      createPokemonDto,
    );
    await this.cacheService.clearByPrefix(POKEMON_CACHE_LIST_KEY);
    return pokemon;
  }
}
