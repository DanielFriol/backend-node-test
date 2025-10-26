import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TypeRepository } from './type.repository';
import { Type } from '@prisma/client';
import { CacheService } from '../cache/cache.service';

const TYPE_CACHE_LIST_KEY = 'types:list';

@Injectable()
export class TypeService {
  constructor(
    private readonly typeRepository: TypeRepository,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(): Promise<Type[]> {
    const cacheKey = `${TYPE_CACHE_LIST_KEY}`;

    const cachedTypes = await this.cacheService.get<Type[]>(cacheKey);
    if (cachedTypes) {
      return cachedTypes;
    }

    const types = await this.typeRepository.findAll();
    await this.cacheService.set(cacheKey, types);
    return types;
  }

  async createOne(name: string): Promise<Type> {
    const existingType = await this.typeRepository.findOneByName(name);

    if (existingType) {
      throw new BadRequestException('Type with this name already exists');
    }

    const type = await this.typeRepository.createOne(name);
    await this.cacheService.clearByPrefix(TYPE_CACHE_LIST_KEY);
    return type;
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

    const updatedType = this.typeRepository.updateOne(id, name);
    await this.cacheService.clearByPrefix(TYPE_CACHE_LIST_KEY);
    return updatedType;
  }

  async deleteOne(id: number): Promise<void> {
    const existingType = await this.typeRepository.findOneById(id);

    if (!existingType) {
      throw new NotFoundException('Type not found');
    }

    await this.typeRepository.deleteOne(id);
    await this.cacheService.clearByPrefix(TYPE_CACHE_LIST_KEY);
  }

  async findManyByNames(types: string[]): Promise<Type[]> {
    const foundTypes = await this.typeRepository.findManyByNames(types);
    if (foundTypes.length !== types.length) {
      throw new NotFoundException('Um ou mais tipos não foram encontrados');
    }
    return foundTypes;
  }

  async upsertTypes(types: string[]): Promise<void> {
    await this.typeRepository.upsertTypes(types);
    await this.cacheService.clearByPrefix(TYPE_CACHE_LIST_KEY);
  }
}
