import { Module } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';
import { PokemonRepository } from './pokemon.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { TypeModule } from '../type/type.module';

@Module({
  imports: [PrismaModule, TypeModule, HttpModule],
  controllers: [PokemonController],
  providers: [PokemonService, PokemonRepository],
})
export class PokemonModule {}
