import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Pokemon } from '@prisma/client';
import { CreatePokemonDto } from './dtos/create-pokemon.dto';

@Injectable()
export class PokemonRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createOne(data: CreatePokemonDto): Promise<Pokemon> {
    return this.prismaService.pokemon.create({
      data,
    });
  }
}
