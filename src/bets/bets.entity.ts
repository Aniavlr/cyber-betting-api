import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/users.entity';
import { Match } from '../matches/matches.entity';

@Entity()
export class Bet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  amount: number;

  @Column()
  team: string;

  @ManyToOne(() => User, (user) => user.bets)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Match, (match) => match.bets)
  match: Match;

  @Column()
  matchId: number;
}
