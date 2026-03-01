"use client";

import * as React from "react";
import { format, addDays, startOfMonth, endOfMonth, isSameDay, eachDayOfInterval } from "date-fns";
import { Calendar as CalendarIcon, Download, Users, ChevronLeft, ChevronRight, Clock, Coffee, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { calendarService } from "@/services/calendar.service";
import { userService } from "@/services/user.service";
import { User, Task, CalendarEvent, UserCapacity } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FeatureGuard } from "@/components/shared/feature-guard";

export default function CalendarPage() {
    const [users, setUsers] = React.useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [isLoading, setIsLoading] = React.useState(true);
    const [data, setData] = React.useState<{ tasks: Task[]; events: CalendarEvent[] }>({ tasks: [], events: [] });
    const [capacities, setCapacities] = React.useState<UserCapacity[]>([]);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    React.useEffect(() => {
        const fetchBaseData = async () => {
            try {
                const allUsers = await userService.getUsers();
                setUsers(allUsers);
                if (allUsers.length > 0) setSelectedUserIds([allUsers[0].id]);
            } catch (err) {
                console.error(err);
            }
        };
        fetchBaseData();
    }, []);

    React.useEffect(() => {
        if (selectedUserIds.length === 0) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const start = startOfMonth(currentDate).toISOString();
                const end = endOfMonth(currentDate).toISOString();
                const result = await calendarService.getCalendar(selectedUserIds, start, end);
                setData(result);

                const caps = await calendarService.getTeamCapacity(selectedUserIds, new Date().toISOString());
                setCapacities(caps);
            } catch (err) {
                toast.error("Failed to fetch calendar data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [selectedUserIds, currentDate]);

    const handleExport = async () => {
        try {
            toast.promise(
                calendarService.exportCalendar(
                    selectedUserIds,
                    startOfMonth(currentDate).toISOString(),
                    endOfMonth(currentDate).toISOString()
                ),
                {
                    loading: 'Generating Excel report...',
                    success: 'Report downloaded successfully',
                    error: 'Export failed'
                }
            );
        } catch (err) {
            console.error(err);
        }
    };

    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const toggleUser = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const toggleAll = () => {
        if (selectedUserIds.length === users.length) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(users.map(u => u.id));
        }
    };

    return (
        <FeatureGuard feature="CALENDAR">
            <div className="flex h-[calc(100vh-120px)] gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Sidebar Filters */}
                <div className="w-72 flex flex-col gap-6">
                    <Card className="bg-surface/50 border-border p-5 flex flex-col gap-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Users className="h-4 w-4" /> Team
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[10px] font-black uppercase px-2"
                                    onClick={toggleAll}
                                >
                                    {selectedUserIds.length === users.length ? "Deselect All" : "Select All"}
                                </Button>
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredUsers.map(user => (
                                    <div key={user.id} className="flex items-center gap-3 group">
                                        <Checkbox
                                            id={`user-${user.id}`}
                                            checked={selectedUserIds.includes(user.id)}
                                            onCheckedChange={() => toggleUser(user.id)}
                                            className="rounded-full border-primary/20 data-[state=checked]:bg-primary"
                                        />
                                        <label htmlFor={`user-${user.id}`} className="text-[11px] font-bold cursor-pointer flex-1 group-hover:text-primary transition-colors truncate">
                                            {user.name || user.email.split('@')[0]}
                                        </label>
                                        <Badge variant="outline" className="text-[8px] font-mono opacity-50 uppercase px-1 h-4">
                                            {user.role?.slice(0, 3)}
                                        </Badge>
                                    </div>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <p className="text-[10px] text-muted-foreground italic text-center py-4">No users found</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border/50">
                            <Button
                                onClick={handleExport}
                                className="w-full gap-2 font-bold uppercase text-[10px] tracking-widest h-11 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
                            >
                                <Download className="h-4 w-4" /> Export Report
                            </Button>
                        </div>
                    </Card>

                    {/* Capacity Card */}
                    <Card className="bg-surface/50 border-border p-5">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Daily Bandwidth</h2>
                        <div className="space-y-4">
                            {capacities.map(cap => {
                                const user = users.find(u => u.id === cap.userId);
                                return (
                                    <div key={cap.userId} className="space-y-1.5">
                                        <div className="flex justify-between text-[11px] font-bold">
                                            <span>{user?.name}</span>
                                            <span className={cn(
                                                cap.capacityPercent > 90 ? "text-destructive" :
                                                    cap.capacityPercent > 70 ? "text-warning" : "text-success"
                                            )}>
                                                {cap.capacityPercent}%
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-500",
                                                    cap.capacityPercent > 90 ? "bg-destructive" :
                                                        cap.capacityPercent > 70 ? "bg-warning" : "bg-primary"
                                                )}
                                                style={{ width: `${cap.capacityPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                {/* Main Calendar View */}
                <Card className="flex-1 bg-surface border-border flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-border flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-primary" />
                                {format(currentDate, "MMMM yyyy")}
                            </h1>
                            <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-lg border border-border/50">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(prev => addDays(prev, -30))}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest h-8 px-3" onClick={() => setCurrentDate(new Date())}>
                                    Today
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentDate(prev => addDays(prev, 30))}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl bg-muted/10" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {days.map(day => {
                                    const dayTasks = data.tasks.filter(t => t.scheduledStart && isSameDay(new Date(t.scheduledStart), day));
                                    const dayEvents = data.events.filter(e => isSameDay(new Date(e.start), day));

                                    if (dayTasks.length === 0 && dayEvents.length === 0) return null;

                                    return (
                                        <div key={day.toISOString()} className="group">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-px flex-1 bg-border/50" />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground py-1 px-3 bg-muted/30 rounded-full">
                                                    {format(day, "EEEE, MMMM do")}
                                                </span>
                                                <div className="h-px flex-1 bg-border/50" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                                                {dayTasks.map(task => (
                                                    <Card key={task.id} className="p-3 bg-primary/5 border-primary/10 hover:border-primary/30 transition-all cursor-pointer">
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <Badge variant="outline" className="text-[9px] bg-primary/20 text-primary border-none">TASK</Badge>
                                                            <span className="text-[10px] font-mono opacity-60 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {task.scheduledStart ? format(new Date(task.scheduledStart), "HH:mm") : "-"}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-sm font-bold line-clamp-1">{task.title}</h3>
                                                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                                            <Briefcase className="h-3 w-3 opacity-50" />
                                                            {task.project?.name || "Global"}
                                                        </p>
                                                        <div className="mt-2 text-[9px] font-bold text-primary/60">
                                                            {task.totalMinutes}m inclusive buffer
                                                        </div>
                                                    </Card>
                                                ))}

                                                {dayEvents.map(event => (
                                                    <Card key={event.id} className="p-3 bg-secondary/5 border-secondary/10 hover:border-secondary/30 transition-all">
                                                        <div className="flex items-start justify-between gap-2 mb-2">
                                                            <Badge variant="outline" className={cn(
                                                                "text-[9px] border-none",
                                                                event.type === 'MEETING' ? "bg-blue-400/20 text-blue-400" :
                                                                    event.type === 'BREAK' ? "bg-amber-400/20 text-amber-400" : "bg-muted text-muted-foreground"
                                                            )}>
                                                                {event.type}
                                                            </Badge>
                                                            <span className="text-[10px] font-mono opacity-60 flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {format(new Date(event.start), "HH:mm")}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-sm font-bold line-clamp-1">{event.title}</h3>
                                                        <div className="mt-2 text-[9px] font-bold opacity-60 flex items-center gap-1">
                                                            {event.type === 'BREAK' && <Coffee className="h-3 w-3" />}
                                                            {(new Date(event.end).getTime() - new Date(event.start).getTime()) / 60000} minutes
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </FeatureGuard>
    );
}
