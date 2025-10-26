import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Type } from '@prisma/client';

@Injectable()
export class TypeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findManyByNames(types: string[]): Promise<Type[]> {
    return this.prismaService.type.findMany({
      where: {
        name: {
          in: types,
        },
      },
    });
  }

  async upsertTypes(types: string[]): Promise<void> {
    const promises = [];
    for (const typeName of types) {
      const promise = this.prismaService.type.upsert({
        where: { name: typeName },
        update: {},
        create: { name: typeName },
      });
      promises.push(promise);
    }
    await Promise.all(promises);
  }
}
