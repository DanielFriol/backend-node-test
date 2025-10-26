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

@Injectable()
export class PokemonService {
  constructor(
    private readonly pokemonsRepository: PokemonRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly typeService: TypeService,
  ) {}

  async createOne(data: CreatePokemonDto): Promise<Pokemon> {
    await this.typeService.findManyByNames(data.types);
    return this.pokemonsRepository.createOne(data);
  }

  async findMany(
    query: FindManyPokemonsQueryDto,
  ): Promise<PaginationResponse<Pokemon>> {
    return this.pokemonsRepository.findMany(query);
  }

  async updateOne(
    id: number,
    data: Partial<CreatePokemonDto>,
  ): Promise<Pokemon> {
    await this.typeService.findManyByNames(data.types);
    await this.checkIfPokemonExists(id);

    return this.pokemonsRepository.updateOne(id, data);
  }

  private async checkIfPokemonExists(id: number) {
    const existingPokemon = await this.pokemonsRepository.findOneById(id);

    if (!existingPokemon) {
      throw new NotFoundException('Pokémon não encontrado.');
    }
  }

  async deleteOne(id: number): Promise<void> {
    await this.checkIfPokemonExists(id);
    return this.pokemonsRepository.deleteOne(id);
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

    return this.pokemonsRepository.upsertOne(id, createPokemonDto);
  }
}
