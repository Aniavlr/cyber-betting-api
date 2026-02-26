import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Match, MatchStatus } from './matches.entity';
import { User } from '../users/users.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockMatchRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockUserRepository = {
  save: jest.fn(),
};

const mockMatch = {
  id: 1,
  date: new Date('2025-06-01'),
  sport: 'dota2',
  status: MatchStatus.PENDING,
  teamA: 'Team Spirit',
  teamB: 'Navi',
  winner: null,
  bets: [],
};

describe('MatchesService', () => {
  let service: MatchesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        { provide: getRepositoryToken(Match), useValue: mockMatchRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
    jest.clearAllMocks();
  });

  describe('getMatchById', () => {
    it('возвращает матч по id', async () => {
      mockMatchRepository.findOneBy.mockResolvedValue(mockMatch);

      expect(await service.getMatchById(1)).toEqual(mockMatch);
    });

    it('бросает NotFoundException если матч не найден', async () => {
      mockMatchRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getMatchById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createMatch', () => {
    it('создаёт матч', async () => {
      mockMatchRepository.create.mockReturnValue(mockMatch);
      mockMatchRepository.save.mockResolvedValue(mockMatch);

      const result = await service.createMatch({
        date: '2025-06-01',
        sport: 'dota2',
        teamA: 'Team Spirit',
        teamB: 'Navi',
      });

      expect(result).toEqual(mockMatch);
    });

    it('бросает BadRequestException если команды совпадают', async () => {
      await expect(
        service.createMatch({
          date: '2025-06-01',
          sport: 'dota2',
          teamA: 'Navi',
          teamB: 'Navi',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('обновляет статус матча', async () => {
      const updated = { ...mockMatch, status: MatchStatus.ONGOING };
      mockMatchRepository.findOneBy
        .mockResolvedValueOnce(mockMatch)
        .mockResolvedValueOnce(updated);
      mockMatchRepository.update.mockResolvedValue(undefined);

      const result = await service.updateStatus(1, {
        status: MatchStatus.ONGOING,
      });
      expect(result.status).toBe(MatchStatus.ONGOING);
    });

    it('бросает NotFoundException если матч не найден', async () => {
      mockMatchRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.updateStatus(999, { status: MatchStatus.ONGOING }),
      ).rejects.toThrow(NotFoundException);
    });

    it('бросает BadRequestException если матч FINISHED', async () => {
      mockMatchRepository.findOneBy.mockResolvedValue({
        ...mockMatch,
        status: MatchStatus.FINISHED,
      });

      await expect(
        service.updateStatus(1, { status: MatchStatus.ONGOING }),
      ).rejects.toThrow(BadRequestException);
    });

    it('бросает BadRequestException если матч CANCELLED', async () => {
      mockMatchRepository.findOneBy.mockResolvedValue({
        ...mockMatch,
        status: MatchStatus.CANCELLED,
      });

      await expect(
        service.updateStatus(1, { status: MatchStatus.PENDING }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('setWinner', () => {
    const ongoingMatch = { ...mockMatch, status: MatchStatus.ONGOING };

    it('устанавливает победителя и начисляет x2', async () => {
      const matchWithBets = {
        ...ongoingMatch,
        bets: [
          { id: 1, team: 'Navi', amount: 100, user: { id: 1, balance: 900 } },
          {
            id: 2,
            team: 'Team Spirit',
            amount: 200,
            user: { id: 2, balance: 800 },
          },
        ],
      };
      mockMatchRepository.findOneBy.mockResolvedValue(ongoingMatch);
      mockMatchRepository.update.mockResolvedValue(undefined);
      mockMatchRepository.findOne.mockResolvedValue(matchWithBets);

      await service.setWinner(1, { winner: 'Navi' });

      // победителю начислено x2
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        id: 1,
        balance: 1100, // 900 + 100*2
      });
      // проигравшему ничего не начисляется
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });

    it('бросает BadRequestException если матч не ONGOING', async () => {
      mockMatchRepository.findOneBy.mockResolvedValue(mockMatch); // PENDING

      await expect(service.setWinner(1, { winner: 'Navi' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('бросает BadRequestException если победитель не из матча', async () => {
      mockMatchRepository.findOneBy.mockResolvedValue(ongoingMatch);

      await expect(
        service.setWinner(1, { winner: 'Unknown Team' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
