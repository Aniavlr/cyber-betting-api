import { Test, TestingModule } from '@nestjs/testing';
import { BetsService } from './bets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bet } from './bets.entity';
import { Match, MatchStatus } from '../matches/matches.entity';
import { User } from '../users/users.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockBetsRepository = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockMatchRepository = {
  findOneBy: jest.fn(),
};

const mockUserRepository = {
  findOneBy: jest.fn(),
  save: jest.fn(),
};

const mockUser = { id: 1, name: 'Anna', balance: 1000 };
const mockMatch = {
  id: 1,
  sport: 'dota2',
  status: MatchStatus.PENDING,
  teamA: 'Team Spirit',
  teamB: 'Navi',
  winner: null,
};

describe('BetsService', () => {
  let service: BetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BetsService,
        { provide: getRepositoryToken(Bet), useValue: mockBetsRepository },
        { provide: getRepositoryToken(Match), useValue: mockMatchRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<BetsService>(BetsService);
    jest.clearAllMocks();
  });

  describe('getAllBets', () => {
    it('возвращает список ставок', async () => {
      const bets = [{ id: 1, amount: 100, team: 'Navi' }];
      mockBetsRepository.find.mockResolvedValue(bets);

      expect(await service.getAllBets()).toEqual(bets);
    });
  });

  describe('getBetsByUserId', () => {
    it('возвращает ставки пользователя', async () => {
      const bets = [{ id: 1, userId: 1, amount: 100, team: 'Navi' }];
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockBetsRepository.find.mockResolvedValue(bets);

      expect(await service.getBetsByUserId(1)).toEqual(bets);
    });

    it('бросает NotFoundException если пользователь не найден', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getBetsByUserId(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createBet', () => {
    const dto = { userId: 1, matchId: 1, team: 'Navi', amount: 100 };

    it('успешно создаёт ставку и списывает баланс', async () => {
      const bet = { id: 1, ...dto };
      mockUserRepository.findOneBy.mockResolvedValue({ ...mockUser });
      mockMatchRepository.findOneBy.mockResolvedValue(mockMatch);
      mockBetsRepository.create.mockReturnValue(bet);
      mockBetsRepository.save.mockResolvedValue(bet);

      const result = await service.createBet(dto);

      expect(result).toEqual(bet);
      // баланс списан
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        balance: 900, // 1000 - 100
      });
    });

    it('бросает NotFoundException если пользователь не найден', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.createBet(dto)).rejects.toThrow(NotFoundException);
    });

    it('бросает NotFoundException если матч не найден', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockMatchRepository.findOneBy.mockResolvedValue(null);

      await expect(service.createBet(dto)).rejects.toThrow(NotFoundException);
    });

    it('бросает BadRequestException если матч не PENDING', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockMatchRepository.findOneBy.mockResolvedValue({
        ...mockMatch,
        status: MatchStatus.ONGOING,
      });

      await expect(service.createBet(dto)).rejects.toThrow(BadRequestException);
    });

    it('бросает BadRequestException если команда не участвует в матче', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockMatchRepository.findOneBy.mockResolvedValue(mockMatch);

      await expect(
        service.createBet({ ...dto, team: 'Unknown' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('бросает BadRequestException если не хватает баланса', async () => {
      mockUserRepository.findOneBy.mockResolvedValue({
        ...mockUser,
        balance: 50,
      });
      mockMatchRepository.findOneBy.mockResolvedValue(mockMatch);

      await expect(service.createBet({ ...dto, amount: 100 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
