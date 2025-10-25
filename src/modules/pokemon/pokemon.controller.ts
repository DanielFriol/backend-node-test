import { Body, Controller, Get, Post } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { CreatePokemonDto } from './dtos/create-pokemon.dto';

@Controller('pokemons')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Post()
  async createOne(@Body() dto: CreatePokemonDto) {
    return this.pokemonService.createOne(dto);
  }

  @Get()
  async findMany() {
    return this.pokemonService.findMany();
  }
}
