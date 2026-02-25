import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Bet } from 'src/bets/bets.entity';

export enum MatchStatus {
  PENDING = 'PENDING',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column()
  sport: string;

  @Column({ type: 'enum', enum: MatchStatus, default: MatchStatus.PENDING })
  status: MatchStatus;

  @Column()
  teamA: string;

  @Column()
  teamB: string;

  @Column({ nullable: true })
  winner: string;

  @OneToMany(() => Bet, (bet) => bet.match)
  bets: Bet[];
}
