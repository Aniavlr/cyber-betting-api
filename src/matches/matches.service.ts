import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from './matches.entity';

import {
  CreateMatchDto,
  UpdateMatchStatusDto,
  SetWinnerDto,
} from './match.dto';
import { User } from '../users/users.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  getAllMatch() {
    return this.matchRepository.find();
  }

  async getMatchById(id: number) {
    const match = await this.matchRepository.findOneBy({ id });
    if (!match) {
      throw new NotFoundException(`Match with ${id} not found`);
    }
    return match;
  }

  async createMatch(body: CreateMatchDto) {
    if (body.teamA == body.teamB) {
      throw new BadRequestException('Teams cannot match');
    }

    const date = new Date(body.date);
    const sport = body.sport;
    const teamA = body.teamA;
    const teamB = body.teamB;
    const match = this.matchRepository.create({ date, sport, teamA, teamB });
    return await this.matchRepository.save(match);
  }

  async updateStatus(id: number, body: UpdateMatchStatusDto) {
    const match = await this.matchRepository.findOneBy({ id });

    if (!match) {
      throw new NotFoundException(`Match with ${id} not found`);
    }

    if (
      match.status === MatchStatus.FINISHED ||
      match.status === MatchStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'You cannot change the status of the completed ot cancelled match',
      );
    }
    await this.matchRepository.update(id, { status: body.status });
    return this.matchRepository.findOneBy({ id });
  }

  async setWinner(id: number, body: SetWinnerDto) {
    const match = await this.matchRepository.findOneBy({ id });

    if (!match) {
      throw new NotFoundException(`Match with ${id} not found`);
    }

    if (match.status !== MatchStatus.ONGOING) {
      throw new BadRequestException(
        'Winner can only be set for a match with status ONGOING',
      );
    }

    if (body.winner !== match.teamA && body.winner !== match.teamB) {
      throw new BadRequestException(
        `Winner must be "${match.teamA}" or "${match.teamB}"`,
      );
    }

    await this.matchRepository.update(id, {
      winner: body.winner,
      status: MatchStatus.FINISHED,
    });

    const updatedMatch = await this.matchRepository.findOne({
      where: { id },
      relations: ['bets', 'bets.user'],
    });

    if (!updatedMatch) {
      throw new NotFoundException(`Match with ${id} not found`);
    }

    for (const bet of updatedMatch.bets) {
      if (bet.team === body.winner) {
        bet.user.balance += bet.amount * 2;
        await this.userRepository.save(bet.user);
      }
    }

    return updatedMatch;
  }
}
