# Implementation Plan: User & Team Calendar with Scheduling

## 1. Data Model Updates (Backend)

### Prisma Schema Enhancements
Update the `Task` model in `prisma/schema.prisma` to support scheduling:
- `estimatedMinutes`: (Int) User's quoted time for the task.
- `bufferMinutes`: (Int) Calculated 15% buffer time.
- `totalMinutes`: (Int) `estimatedMinutes + bufferMinutes` (stored for easy reporting).
- `scheduledStart`: (DateTime?) Start time on the calendar.
- `scheduledEnd`: (DateTime?) End time on the calendar.

Add a new `CalendarEvent` model (Optional but Recommended):
- To handle non-task blocks like "Standup", "Break", "OOO".
- Fields: `id`, `userId`, `title`, `type` (BREAK, MEETING, OOO, OTHER), `start`, `end`.

## 2. Backend Logic (NestJS)

### Task Service Augmentation
- Implement logic to automatically calculate `bufferMinutes` (15%) whenever `estimatedMinutes` is updated.
- Update `scheduledEnd` based on `scheduledStart` and `totalMinutes` if the user just provides a start time.

### Calendar Service
- `getCalendar(userIds: string[], startDate: Date, endDate: Date)`: Fetch both Tasks and CalendarEvents.
- `calculateCapacity(userId: string, date: Date)`: 
  - Total Available: 8 Hours (9 total - 1 break).
  - Used: Sum of `totalMinutes` for scheduled tasks + duration of meetings.
  - Return: `% Capacity`.

### Export Service (Excel Generation)
- Use `exceljs`.
- Endpoint: `GET /calendar/export?userIds=u1,u2&startDate=...&endDate=...`
- Multi-sheet workbook: One sheet per user.
- Map calendar days to rows/columns showing task titles and durations.

## 3. Frontend Implementation (React/Next.js)

### State Management
- Extend `taskService` to handle new scheduling fields.
- Create `calendarService` for fetching events and triggering exports.

### UI Components
- **Calendar View**: Replace/Enhance existing timeline or add a full `/calendar` page.
- **Task Scheduling Panel**: In `TaskDetailDialog`, add inputs for Estimations and a "Schedule" button that opens a mini-calendar/time-picker.
- **Team Sidebar Link**: Add "Calendar" to `AppSidebar`.
- **Stat Card Update**: Modify Dashboard's "Team Capacity" to use the new 8h-workday-based calculation.

### Export Dialog
- A modal to select users and date ranges for the Excel download.

## 4. Workday Policy Enforcement
- Default Workday: 9 Hours.
- Default Break: 1 Hour (User can schedule break blocks, or we assume a 1h deduction from the 9h).
- Buffer: 15% of quoted task time.

## 5. Timeline
1. **Migrations & Schema**: Update DB and types.
2. **Backend API**: CRUD for scheduling + Capacity logic.
3. **Excel Export**: Server-side report generation.
4. **Frontend View**: `/calendar` page and sidebar integration.
5. **Integration**: Connect Scheduling UI and Dashboard Stats.
