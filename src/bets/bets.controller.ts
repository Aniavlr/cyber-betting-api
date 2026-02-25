import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { BetsService } from './bets.service';
import { CreateBetDto } from './bet.dto';

@Controller('bets')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Get()
  getAllBets() {
    return this.betsService.getAllBets();
  }

  @Get('user/:userId')
  getBetsByUserId(@Param('userId') id: string) {
    return this.betsService.getBetsByUserId(Number(id));
  }

  @Post()
  createBet(@Body() body: CreateBetDto) {
    return this.betsService.createBet(body);
  }
}
