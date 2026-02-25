import { IsString, IsNotEmpty, IsDateString, IsEnum } from 'class-validator';
import { MatchStatus } from './matches.entity';

export class CreateMatchDto {
  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  sport: string;

  @IsString()
  @IsNotEmpty()
  teamA: string;

  @IsString()
  @IsNotEmpty()
  teamB: string;
}

export class UpdateMatchStatusDto {
  @IsEnum(MatchStatus)
  status: MatchStatus;
}

export class SetWinnerDto {
  @IsString()
  @IsNotEmpty()
  winner: string;
}
