import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bet } from './bets.entity';

import { CreateBetDto } from './bet.dto';

import { Match, MatchStatus } from '../matches/matches.entity';
import { User } from '../users/users.entity';

@Injectable()
export class BetsService {
  constructor(
    @InjectRepository(Bet)
    private betsRepository: Repository<Bet>,

    @InjectRepository(Match)
    private matchRepository: Repository<Match>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  getAllBets() {
    return this.betsRepository.find();
  }

  async getBetsByUserId(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException(`Bet with ${userId} not found`);
    }

    return this.betsRepository.find({
      where: { userId },
      relations: ['match'],
    });
  }

  async createBet(body: CreateBetDto) {
    const user = await this.userRepository.findOneBy({ id: body.userId });
    if (!user) {
      throw new NotFoundException(`User with ${body.userId} not found`);
    }

    const match = await this.matchRepository.findOneBy({ id: body.matchId });
    if (!match) {
      throw new NotFoundException(`Match with ${body.matchId} not found`);
    }

    if (match.status !== MatchStatus.PENDING) {
      throw new BadRequestException(
        'Bets are accepted only if the status is PENDING',
      );
    }

    if (body.team !== match.teamA && body.team !== match.teamB) {
      throw new BadRequestException(
        `Team must be "${match.teamA}" or "${match.teamB}"`,
      );
    }

    if (user.balance < body.amount) {
      throw new BadRequestException(
        `Insufficient funds. Balance: ${user.balance}, bet: ${body.amount}`,
      );
    }

    user.balance -= body.amount;
    await this.userRepository.save(user);

    const bet = this.betsRepository.create({
      userId: body.userId,
      matchId: body.matchId,
      team: body.team,
      amount: body.amount,
    });

    return this.betsRepository.save(bet);
  }
}
