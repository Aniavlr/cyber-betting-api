import { Module } from '@nestjs/common';

import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { Match } from './matches.entity';
import { User } from 'src/users/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Match, User])],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
