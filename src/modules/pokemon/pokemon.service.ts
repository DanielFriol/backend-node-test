import { Injectable, NotFoundException } from '@nestjs/common';
import { PokemonRepository } from './pokemon.repository';
import { CreatePokemonDto } from './dtos/create-pokemon.dto';
import { Pokemon } from '@prisma/client';

@Injectable()
export class PokemonService {
  constructor(private readonly pokemonsRepository: PokemonRepository) {}

  async createOne(data: CreatePokemonDto): Promise<Pokemon> {
    return this.pokemonsRepository.createOne(data);
  }

  async findMany(): Promise<Pokemon[]> {
    return this.pokemonsRepository.findMany();
  }

  async updateOne(
    id: number,
    data: Partial<CreatePokemonDto>,
  ): Promise<Pokemon> {
    const existingPokemon = await this.pokemonsRepository.findOneById(id);

    if (!existingPokemon) {
      throw new NotFoundException('Pokémon não encontrado.');
    }

    return this.pokemonsRepository.updateOne(id, data);
  }

  async deleteOne(id: number): Promise<void> {
    const existingPokemon = await this.pokemonsRepository.findOneById(id);

    if (!existingPokemon) {
      throw new NotFoundException('Pokémon não encontrado.');
    }

    return this.pokemonsRepository.deleteOne(id);
  }
}
