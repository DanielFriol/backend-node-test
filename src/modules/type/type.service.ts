import { Injectable, NotFoundException } from '@nestjs/common';
import { TypeRepository } from './type.repository';

@Injectable()
export class TypeService {
  constructor(private readonly typeRepository: TypeRepository) {}

  async findManyByNames(types: string[]) {
    const foundTypes = await this.typeRepository.findManyByNames(types);
    if (foundTypes.length !== types.length) {
      throw new NotFoundException('Um ou mais tipos não foram encontrados');
    }
    return foundTypes;
  }

  async upsertTypes(types: string[]) {
    return this.typeRepository.upsertTypes(types);
  }
}
