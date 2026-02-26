import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Bet } from '../bets/bets.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'float', default: 1000 })
  balance: number;

  @OneToMany(() => Bet, (bet) => bet.user)
  bets: Bet[];
}
