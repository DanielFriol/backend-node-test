import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { CreatePokemonDto } from './dtos/create-pokemon.dto';
import { UpdatePokemonDto } from './dtos/update-pokemon.dto';

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

  @Patch(':id')
  async updateOne(@Param('id') id: number, @Body() dto: UpdatePokemonDto) {
    return this.pokemonService.updateOne(id, dto);
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: number) {
    return this.pokemonService.deleteOne(id);
  }
}
