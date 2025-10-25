import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { CreatePokemonDto } from './dtos/create-pokemon.dto';
import { UpdatePokemonDto } from './dtos/update-pokemon.dto';
import { FindManyPokemonsQueryDto } from './dtos/find-many-pokemons-query.dto';
import { PaginationResponse } from '../commons/pagination.response';
import { Pokemon } from '@prisma/client';

@Controller('pokemons')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Post()
  async createOne(@Body() dto: CreatePokemonDto): Promise<Pokemon> {
    return this.pokemonService.createOne(dto);
  }

  @Get()
  async findMany(
    @Query() query: FindManyPokemonsQueryDto,
  ): Promise<PaginationResponse<Pokemon>> {
    return this.pokemonService.findMany(query);
  }

  @Patch(':id')
  async updateOne(
    @Param('id') id: number,
    @Body() dto: UpdatePokemonDto,
  ): Promise<Pokemon> {
    return this.pokemonService.updateOne(id, dto);
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: number): Promise<void> {
    return this.pokemonService.deleteOne(id);
  }

  @Post('import/:id')
  async importFromPokeApi(@Param('id') id: number): Promise<Pokemon> {
    return this.pokemonService.importFromPokeApi(id);
  }
}
