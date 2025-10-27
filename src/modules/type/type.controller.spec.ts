import { Test, TestingModule } from '@nestjs/testing';
import { TypeController } from './type.controller';
import { TypeService } from './type.service';
import { CreateTypeDto } from './dtos/create-type.dto';

const mockTypeService = () => ({
  findAll: jest.fn(),
  createOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
});

describe('TypeController', () => {
  let controller: TypeController;
  let service: ReturnType<typeof mockTypeService>;

  const mockType = { id: 1, name: 'GRASS' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeController],
      providers: [{ provide: TypeService, useFactory: mockTypeService }],
    }).compile();

    controller = module.get<TypeController>(TypeController);
    service = module.get(TypeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of types', async () => {
      service.findAll.mockResolvedValue([mockType]);
      const result = await controller.findAll();
      expect(result).toEqual([mockType]);
    });
  });

  describe('createType', () => {
    it('should create a type', async () => {
      const dto: CreateTypeDto = { name: 'GRASS' };
      service.createOne.mockResolvedValue(mockType);
      const result = await controller.createType(dto);
      expect(result).toEqual(mockType);
    });
  });

  describe('updateType', () => {
    it('should update a type', async () => {
      const dto: CreateTypeDto = { name: 'POISON' };
      const updatedType = { ...mockType, name: 'POISON' };
      service.updateOne.mockResolvedValue(updatedType);
      const result = await controller.updateType(1, dto);
      expect(result).toEqual(updatedType);
    });
  });

  describe('deleteType', () => {
    it('should delete a type', async () => {
      await controller.deleteType(1);
      expect(service.deleteOne).toHaveBeenCalledWith(1);
    });
  });
});
