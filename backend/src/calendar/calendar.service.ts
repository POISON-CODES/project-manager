import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { format, startOfDay, endOfDay, addDays } from 'date-fns';

@Injectable()
export class CalendarService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Fetch calendar data (Tasks + Events) for multiple users within a range.
     */
    async getCalendar(userIds: string[], start: Date, end: Date) {
        const [tasks, events] = await Promise.all([
            this.prisma.task.findMany({
                where: {
                    assigneeId: { in: userIds },
                    scheduledStart: { gte: start },
                    scheduledEnd: { lte: end },
                },
                include: { story: { select: { project: { select: { name: true } } } } } as any,
            }),
            this.prisma.calendarEvent.findMany({
                where: {
                    userId: { in: userIds },
                    start: { gte: start },
                    end: { lte: end },
                },
            }) as any,
        ]);

        return { tasks, events };
    }

    /**
     * Calculate bandwidth/capacity for a set of users on a specific day.
     */
    async calculateTeamCapacity(userIds: string[], date: Date) {
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        const [tasks, events] = await Promise.all([
            this.prisma.task.findMany({
                where: {
                    assigneeId: { in: userIds },
                    scheduledStart: { lte: dayEnd },
                    scheduledEnd: { gte: dayStart },
                },
            }) as any,
            this.prisma.calendarEvent.findMany({
                where: {
                    userId: { in: userIds },
                    start: { lte: dayEnd },
                    end: { gte: dayStart },
                },
            }) as any,
        ]);

        const capacities = userIds.map((userId) => {
            const userTasks = tasks.filter((t: any) => t.assigneeId === userId);
            const userEvents = events.filter((e: any) => e.userId === userId);

            // Sum task durations (using totalMinutes which includes 15% buffer)
            let scheduledMinutes = userTasks.reduce((sum: number, t: any) => sum + (t.totalMinutes || 0), 0);

            // Sum non-break events (Meetings, OOO)
            userEvents.forEach((e: any) => {
                if (e.type !== 'BREAK') {
                    const duration = (e.end.getTime() - e.start.getTime()) / (1000 * 60);
                    scheduledMinutes += duration;
                }
            });

            // 8 hours available (9 total - 1 break)
            const availableMinutes = 8 * 60;
            const capacityPercent = (scheduledMinutes / availableMinutes) * 100;

            return {
                userId,
                scheduledMinutes,
                availableMinutes,
                capacityPercent: Math.min(Math.round(capacityPercent), 100),
            };
        });

        return capacities;
    }

    /**
     * Create a new calendar event.
     */
    async createEvent(userId: string, dto: CreateCalendarEventDto) {
        return this.prisma.calendarEvent.create({
            data: {
                ...dto,
                userId,
                start: new Date(dto.start),
                end: new Date(dto.end),
            },
        } as any);
    }

    /**
     * Export calendar data to Excel.
     */
    async exportToExcel(userIds: string[], start: Date, end: Date, res: Response) {
        const workbook = new ExcelJS.Workbook();

        // Fetch users for sheet names
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
        });

        for (const user of users) {
            const sheet = workbook.addWorksheet(user.name || user.email);

            // Set headers
            sheet.columns = [
                { header: 'Date', key: 'date', width: 15 },
                { header: 'Type', key: 'type', width: 15 },
                { header: 'Subject', key: 'subject', width: 40 },
                { header: 'Start', key: 'start', width: 10 },
                { header: 'End', key: 'end', width: 10 },
                { header: 'Total Minutes (incl. 15% Buffer)', key: 'duration', width: 25 },
                { header: 'Daily Capacity %', key: 'capacity', width: 15 },
            ];

            // Fetch data for this user
            const { tasks, events } = await this.getCalendar([user.id], start, end);

            // Group by day to calculate capacity
            let current = new Date(start);
            while (current <= end) {
                const dStart = startOfDay(current);
                const dEnd = endOfDay(current);

                const dayTasks = (tasks as any[]).filter(t => t.scheduledStart && t.scheduledStart <= dEnd && (t.scheduledEnd || t.scheduledStart) >= dStart);
                const dayEvents = (events as any[]).filter(e => e.start <= dEnd && e.end >= dStart);

                // Add Task rows
                dayTasks.forEach(t => {
                    sheet.addRow({
                        date: format(current, 'yyyy-MM-dd'),
                        type: 'TASK',
                        subject: t.title,
                        start: t.scheduledStart ? format(t.scheduledStart, 'HH:mm') : '-',
                        end: t.scheduledEnd ? format(t.scheduledEnd, 'HH:mm') : '-',
                        duration: t.totalMinutes,
                        capacity: '', // Will fill summary
                    });
                });

                // Add Event rows
                dayEvents.forEach(e => {
                    sheet.addRow({
                        date: format(current, 'yyyy-MM-dd'),
                        type: e.type,
                        subject: e.title,
                        start: format(e.start, 'HH:mm'),
                        end: format(e.end, 'HH:mm'),
                        duration: (e.end.getTime() - e.start.getTime()) / (1000 * 60),
                        capacity: '',
                    });
                });

                // Add a separator/summary row for the day
                const dayCap = await this.calculateTeamCapacity([user.id], current);
                sheet.addRow({
                    date: format(current, 'yyyy-MM-dd'),
                    type: 'SUMMARY',
                    subject: 'Daily Total',
                    duration: dayCap[0].scheduledMinutes,
                    capacity: `${dayCap[0].capacityPercent}%`,
                }).font = { bold: true };

                sheet.addRow({}); // Empty spacer
                current = addDays(current, 1);
            }
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Calendar_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    }
}
