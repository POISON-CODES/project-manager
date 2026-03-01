import { api } from "@/lib/api";
import { CalendarEvent, Task, UserCapacity } from "@/types";

export const calendarService = {
    /**
     * Fetch calendar items (tasks and events) for multiple users.
     */
    async getCalendar(userIds: string[], start: string, end: string) {
        const response = await api.get<{ tasks: Task[]; events: CalendarEvent[] }>("/calendar", {
            params: { userIds: userIds.join(","), start, end }
        });
        return response.data;
    },

    /**
     * Calculate capacity for multiple users for a specific date.
     */
    async getTeamCapacity(userIds: string[], date: string) {
        const response = await api.get<UserCapacity[]>("/calendar/capacity", {
            params: { userIds: userIds.join(","), date }
        });
        return response.data;
    },

    /**
     * Create a new non-task calendar event (meeting, break, etc).
     */
    async createEvent(event: Partial<CalendarEvent>) {
        const response = await api.post<CalendarEvent>("/calendar/events", event);
        return response.data;
    },

    /**
     * Trigger backend Excel export for calendar reporting.
     */
    async exportCalendar(userIds: string[], start: string, end: string) {
        const response = await api.get("/calendar/export", {
            params: { userIds: userIds.join(","), start, end },
            responseType: 'blob'
        });

        // Handle browser download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Team_Calendar_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};
