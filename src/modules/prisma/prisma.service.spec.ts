import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { Logger } from '@nestjs/common';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to prisma and log a message', async () => {
      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();
      const loggerSpy = jest.spyOn(Logger, 'log');
      await service.onModuleInit();
      expect(connectSpy).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        'Connected to Prisma',
        'PrismaService',
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from prisma and log a message', async () => {
      const disconnectSpy = jest
        .spyOn(service, '$disconnect')
        .mockResolvedValue();
      const loggerSpy = jest.spyOn(Logger, 'log');
      await service.onModuleDestroy();
      expect(disconnectSpy).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        'Closing Prisma Connection',
        'PrismaService',
      );
    });
  });
});
