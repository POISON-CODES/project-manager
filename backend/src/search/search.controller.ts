import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('global')
  async globalSearch(@Query('q') query: string) {
    const results = await this.searchService.globalSearch(query);
    return {
      success: true,
      data: results,
    };
  }
}
