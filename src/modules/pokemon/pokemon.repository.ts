import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Pokemon } from '@prisma/client';
import { CreatePokemonDto } from './dtos/create-pokemon.dto';
import { UpdatePokemonDto } from './dtos/update-pokemon.dto';

@Injectable()
export class PokemonRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createOne(data: CreatePokemonDto): Promise<Pokemon> {
    return this.prismaService.pokemon.create({
      data,
    });
  }

  async findMany(): Promise<Pokemon[]> {
    return this.prismaService.pokemon.findMany({});
  }

  async updateOne(id: number, data: UpdatePokemonDto): Promise<Pokemon> {
    return this.prismaService.pokemon.update({
      where: { id },
      data,
    });
  }

  async findOneById(id: number): Promise<Pokemon | null> {
    return this.prismaService.pokemon.findUnique({
      where: { id },
    });
  }

  async deleteOne(id: number): Promise<void> {
    await this.prismaService.pokemon.delete({
      where: { id },
    });
  }
}
