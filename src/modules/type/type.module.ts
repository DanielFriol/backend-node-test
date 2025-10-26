import { Module } from '@nestjs/common';
import { TypeService } from './type.service';
import { TypeRepository } from './type.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { TypeController } from './type.controller';
import { CustomCacheModule } from '../cache/cache.module';

@Module({
  imports: [PrismaModule, CustomCacheModule],
  exports: [TypeService],
  controllers: [TypeController],
  providers: [TypeService, TypeRepository],
})
export class TypeModule {}
