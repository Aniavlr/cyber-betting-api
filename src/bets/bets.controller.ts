import { Controller, Get, Param } from '@nestjs/common';
import { BetsService } from './bets.service';

@Controller('bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Get()
  getBets(): string {
    return this.betsService.getBets();
  }

  @Get(':id')
  getBetsById(@Param('id') id: string): string {
    return this.betsService.getBetsById(id);
  }
}
