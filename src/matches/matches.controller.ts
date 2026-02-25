import { Controller, Get, Param, Body, Post, Patch } from '@nestjs/common';
import { MatchesService } from './matches.service';
import {
  CreateMatchDto,
  UpdateMatchStatusDto,
  SetWinnerDto,
} from './match.dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  getAllMatch() {
    return this.matchesService.getAllMatch();
  }

  @Get(':id')
  getMatchById(@Param('id') id: string) {
    return this.matchesService.getMatchById(Number(id));
  }

  @Post()
  createMatch(@Body() body: CreateMatchDto) {
    return this.matchesService.createMatch(body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UpdateMatchStatusDto) {
    return this.matchesService.updateStatus(Number(id), body);
  }

  @Patch(':id/winner')
  setWinner(@Param('id') id: string, @Body() body: SetWinnerDto) {
    return this.matchesService.setWinner(Number(id), body);
  }
}
