import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TypeService } from './type.service';
import { CreateTypeDto } from './dtos/create-type.dto';
import { Type } from '@prisma/client';

@Controller('types')
export class TypeController {
  constructor(private readonly typeService: TypeService) {}

  @Get()
  async findAll(): Promise<Type[]> {
    return this.typeService.findAll();
  }

  @Post()
  async createType(@Body() data: CreateTypeDto): Promise<Type> {
    return this.typeService.createOne(data.name);
  }

  @Patch(':id')
  async updateType(
    @Param('id') id: number,
    @Body() data: CreateTypeDto,
  ): Promise<Type> {
    return this.typeService.updateOne(id, data.name);
  }

  @Delete(':id')
  async deleteType(@Param('id') id: number): Promise<void> {
    return this.typeService.deleteOne(id);
  }
}
