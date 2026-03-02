import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
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
  getBetsByUserId(@Param('userId', ParseIntPipe) id: number) {
    return this.betsService.getBetsByUserId(id);
  }

  @Post()
  createBet(@Body() body: CreateBetDto) {
    return this.betsService.createBet(body);
  }
}
