import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { PokemonModule } from './modules/pokemon/pokemon.module';
import { ConfigModule } from '@nestjs/config';
import { TypeModule } from './modules/type/type.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomCacheModule } from './modules/cache/cache.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 300000,
      namespace: '',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CustomCacheModule,
    PrismaModule,
    PokemonModule,
    TypeModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
