import { Test, TestingModule } from '@nestjs/testing';
import { TypeRepository } from './type.repository';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = () => ({
  type: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
  },
});

describe('TypeRepository', () => {
  let repository: TypeRepository;
  let prisma: ReturnType<typeof mockPrismaService>;

  const mockType = { id: 1, name: 'GRASS' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeRepository,
        { provide: PrismaService, useFactory: mockPrismaService },
      ],
    }).compile();

    repository = module.get<TypeRepository>(TypeRepository);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of types', async () => {
      prisma.type.findMany.mockResolvedValue([mockType]);
      const result = await repository.findAll();
      expect(result).toEqual([mockType]);
    });
  });

  describe('findOneById', () => {
    it('should return a type by id', async () => {
      prisma.type.findUnique.mockResolvedValue(mockType);
      const result = await repository.findOneById(1);
      expect(result).toEqual(mockType);
    });
  });

  describe('createOne', () => {
    it('should create a type', async () => {
      prisma.type.create.mockResolvedValue(mockType);
      const result = await repository.createOne('GRASS');
      expect(result).toEqual(mockType);
    });
  });

  describe('findOneByName', () => {
    it('should return a type by name', async () => {
      prisma.type.findUnique.mockResolvedValue(mockType);
      const result = await repository.findOneByName('GRASS');
      expect(result).toEqual(mockType);
    });
  });

  describe('updateOne', () => {
    it('should update a type', async () => {
      const updatedType = { ...mockType, name: 'POISON' };
      prisma.type.update.mockResolvedValue(updatedType);
      const result = await repository.updateOne(1, 'POISON');
      expect(result).toEqual(updatedType);
    });
  });

  describe('deleteOne', () => {
    it('should delete a type', async () => {
      await repository.deleteOne(1);
      expect(prisma.type.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('findManyByNames', () => {
    it('should return an array of types by names', async () => {
      prisma.type.findMany.mockResolvedValue([mockType]);
      const result = await repository.findManyByNames(['GRASS']);
      expect(result).toEqual([mockType]);
    });
  });

  describe('upsertTypes', () => {
    it('should upsert types', async () => {
      await repository.upsertTypes(['GRASS', 'POISON']);
      expect(prisma.type.upsert).toHaveBeenCalledTimes(2);
    });
  });
});
