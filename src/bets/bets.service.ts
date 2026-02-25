import { Injectable } from '@nestjs/common';

@Injectable()
export class BetsService {
  getBets(): string {
    return 'Bets';
  }
  getBetsById(id: string): string {
    return `bets ${id}`;
  }
}
