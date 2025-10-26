import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { HelloModule } from './modules/hello/hello.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { TypeOrmModule } from '@nestjs/typeorm';
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
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
      },
    }),
    CustomCacheModule,
    HelloModule,
    PrismaModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './database/database_orm.sqlite',
      autoLoadEntities: true,
      synchronize: true,
      migrations: ['../typeorm/migrations/*.ts'],
    }),
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
