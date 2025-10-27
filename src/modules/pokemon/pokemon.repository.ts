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
      data: {
        name: data.name,
        types: {
          connect: data.types.map((type) => ({ name: type })),
        },
      },
      include: {
        types: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findMany(
    query: FindManyPokemonsQueryDto,
  ): Promise<PaginationResponse<Pokemon>> {
    const { page, limit, name, type, order } = query;

    const where = {
      name: name ? { contains: name.toLowerCase() } : undefined,
      types: type
        ? { some: { name: { equals: type.toUpperCase() } } }
        : undefined,
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
        include: {
          types: {
            select: {
              name: true,
            },
          },
        },
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
      data: {
        name: data.name,
        types: data.types
          ? {
              set: data.types.map((type) => ({ name: type })),
            }
          : undefined,
      },
      include: {
        types: {
          select: {
            name: true,
          },
        },
      },
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
    const parsedData = {
      name: data.name,
      types: data.types.length
        ? {
            connect: data.types.map((type) => ({ name: type })),
          }
        : undefined,
    };

    return this.prismaService.pokemon.upsert({
      where: { id },
      update: parsedData,
      create: parsedData,
      include: {
        types: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
