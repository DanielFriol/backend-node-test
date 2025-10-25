import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Pokemon } from '@prisma/client';
import { CreatePokemonDto } from './dtos/create-pokemon.dto';
import { UpdatePokemonDto } from './dtos/update-pokemon.dto';
import { FindManyPokemonsQueryDto } from './dtos/find-many-pokemons-query.dto';
import { PaginationResponse } from '../commons/pagination.response';

@Injectable()
export class PokemonRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createOne(data: CreatePokemonDto): Promise<Pokemon> {
    return this.prismaService.pokemon.create({
      data,
    });
  }

  async findMany(
    query: FindManyPokemonsQueryDto,
  ): Promise<PaginationResponse<Pokemon>> {
    const { page, limit, name, type, order } = query;

    const where = {
      name: name ? { contains: name.toLowerCase() } : undefined,
      type: type ? { equals: type.toUpperCase() } : undefined,
    };

    const skip = (page - 1) * limit;

    const [total, data] = await this.prismaService.$transaction([
      this.prismaService.pokemon.count({ where }),
      this.prismaService.pokemon.findMany({
        where,
        orderBy: {
          name: order,
        },
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      data,
    };
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

  async upsertOne(id: number, data: CreatePokemonDto): Promise<Pokemon> {
    return this.prismaService.pokemon.upsert({
      where: { id },
      update: data,
      create: data,
    });
  }
}
