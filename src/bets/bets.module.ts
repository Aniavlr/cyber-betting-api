import { Module } from '@nestjs/common';

import { BetsController } from './bets.controller';
import { BetsService } from './bets.service';
import { Bet } from './bets.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from 'src/users/users.entity';
import { Match } from 'src/matches/matches.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Bet, User, Match])],
  controllers: [BetsController],
  providers: [BetsService],
})
export class BetsModule {}
