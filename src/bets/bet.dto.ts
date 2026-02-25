import { IsInt, IsString, IsNotEmpty, IsPositive, Min } from 'class-validator';

export class CreateBetDto {
  @IsInt()
  userId: number;

  @IsInt()
  matchId: number;

  @IsString()
  @IsNotEmpty()
  team: string;

  @IsPositive()
  @Min(1)
  amount: number;
}
