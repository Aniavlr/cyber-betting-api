import { Controller, Get } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}
  @Get()
  getMatch(): string {
    return this.matchesService.getMatch();
  }
}
