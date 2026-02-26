import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './users.entity';
import { NotFoundException } from '@nestjs/common';

const mockUserRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  describe('getAllUser', () => {
    it('возвращает список пользователей', async () => {
      const users = [{ id: 1, name: 'Anna', balance: 1000 }];
      mockUserRepository.find.mockResolvedValue(users);

      expect(await service.getAllUser()).toEqual(users);
    });

    it('возвращает пустой массив если пользователей нет', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      expect(await service.getAllUser()).toEqual([]);
    });
  });

  describe('getUserById', () => {
    it('возвращает пользователя по id', async () => {
      const user = { id: 1, name: 'Anna', balance: 1000 };
      mockUserRepository.findOneBy.mockResolvedValue(user);

      expect(await service.getUserById(1)).toEqual(user);
    });

    it('бросает NotFoundException если пользователь не найден', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getUserById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createUser', () => {
    it('создаёт пользователя', async () => {
      const user = { id: 1, name: 'Anna', balance: 1000 };
      mockUserRepository.create.mockReturnValue(user);
      mockUserRepository.save.mockResolvedValue(user);

      expect(await service.createUser({ name: 'Anna' })).toEqual(user);
      expect(mockUserRepository.create).toHaveBeenCalledWith({ name: 'Anna' });
    });
  });
});
