import { Injectable } from '@nestjs/common';
import { PokemonRepository } from './pokemon.repository';
import { CreatePokemonDto } from './dtos/create-pokemon.dto';
import { Pokemon } from '@prisma/client';

@Injectable()
export class PokemonService {
  constructor(private readonly pokemonsRepository: PokemonRepository) {}

  async createOne(data: CreatePokemonDto): Promise<Pokemon> {
    return this.pokemonsRepository.createOne(data);
  }
}
