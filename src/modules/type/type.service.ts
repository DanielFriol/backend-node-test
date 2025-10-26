import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TypeRepository } from './type.repository';
import { Type } from '@prisma/client';

@Injectable()
export class TypeService {
  constructor(private readonly typeRepository: TypeRepository) {}

  async findAll() {
    return this.typeRepository.findAll();
  }

  async createOne(name: string): Promise<Type> {
    const existingType = await this.typeRepository.findOneByName(name);

    if (existingType) {
      throw new BadRequestException('Type with this name already exists');
    }

    return this.typeRepository.createOne(name);
  }

  async updateOne(id: number, name: string): Promise<Type> {
    const existingTypeById = await this.typeRepository.findOneById(id);

    if (!existingTypeById) {
      throw new NotFoundException('Type not found');
    }

    const existingTypeByName = await this.typeRepository.findOneByName(name);

    if (existingTypeByName && existingTypeByName.id !== id) {
      throw new BadRequestException('Type with this name already exists');
    }

    return this.typeRepository.updateOne(id, name);
  }

  async deleteOne(id: number): Promise<void> {
    const existingType = await this.typeRepository.findOneById(id);

    if (!existingType) {
      throw new NotFoundException('Type not found');
    }

    return this.typeRepository.deleteOne(id);
  }

  async findManyByNames(types: string[]): Promise<Type[]> {
    const foundTypes = await this.typeRepository.findManyByNames(types);
    if (foundTypes.length !== types.length) {
      throw new NotFoundException('Um ou mais tipos não foram encontrados');
    }
    return foundTypes;
  }

  async upsertTypes(types: string[]): Promise<void> {
    return this.typeRepository.upsertTypes(types);
  }
}
