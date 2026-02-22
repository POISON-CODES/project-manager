import { Controller, Get, Post, Body, Query, Res, UseGuards, Request } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { JwtAuthGuard } from '../common/guards/auth.guard';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
    constructor(private readonly calendarService: CalendarService) { }

    @Get()
    async getCalendar(
        @Query('userIds') userIds: string,
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        const ids = userIds ? userIds.split(',') : [];
        return this.calendarService.getCalendar(ids, new Date(start), new Date(end));
    }

    @Get('capacity')
    async getTeamCapacity(
        @Query('userIds') userIds: string,
        @Query('date') date: string,
    ) {
        const ids = userIds ? userIds.split(',') : [];
        return this.calendarService.calculateTeamCapacity(ids, new Date(date));
    }

    @Post('events')
    async createEvent(@Request() req: any, @Body() dto: CreateCalendarEventDto) {
        return this.calendarService.createEvent(req.user.id, dto);
    }

    @Get('export')
    async export(
        @Query('userIds') userIds: string,
        @Query('start') start: string,
        @Query('end') end: string,
        @Res() res: any,
    ) {
        const ids = userIds ? userIds.split(',') : [];
        await this.calendarService.exportToExcel(
            ids,
            new Date(start),
            new Date(end),
            res,
        );
    }
}
