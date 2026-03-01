"use client";

import * as React from "react";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    User as UserIcon,
    AlertCircle,
    CheckCircle2,
    CalendarDays
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, getInitials } from "@/lib/utils";
import { Task, SystemStatus } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface TasksTimelineProps {
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
}

export function TasksTimeline({ tasks, onTaskClick }: TasksTimelineProps) {
    // Generate a reasonable date range for the tasks
    const [viewDate, setViewDate] = React.useState(new Date());

    // Timeline Configuration
    const colWidth = 140; // Pixels per month
    const rowHeight = 64; // Pixels per row

    // Find min and max dates from tasks to bound the timeline
    const taskDates = tasks.flatMap(t => {
        const start = t.startDate ? new Date(t.startDate) : new Date(t.createdAt);
        const end = t.dueDate ? new Date(t.dueDate) : new Date(new Date(t.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000);
        return [start, end];
    }).filter(d => !isNaN(d.getTime()));

    const minDate = taskDates.length > 0
        ? new Date(Math.min(...taskDates.map(d => d.getTime())))
        : new Date();

    // Set to start of the earliest task's month
    const timelineStart = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

    // Generate 6 months from start
    const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(timelineStart);
        d.setMonth(d.getMonth() + i);
        return d;
    });

    const monthNames = months.map(m => m.toLocaleDateString("en-US", { month: "short", year: "2-digit" }));

    return (
        <div className="flex flex-col h-full bg-surface/20 rounded-2xl border border-border/40 overflow-hidden animate-in fade-in duration-500">
            {/* Timeline Header Controls */}
            <div className="flex items-center justify-between p-4 border-b border-border/30 bg-muted/5 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <CalendarDays className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Task Schedule</h3>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-50">Visual Resource allocation</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/50">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary">
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 text-primary/80">
                            {monthNames[0]} - {monthNames[months.length - 1]}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary">
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Timeline Grid */}
            <ScrollArea className="flex-1">
                <div className="min-w-max">
                    {/* Grid Header */}
                    <div className="flex border-b border-border/20 bg-muted/10 sticky top-0 z-10 backdrop-blur-sm">
                        <div className="w-[280px] shrink-0 p-4 font-black text-[9px] uppercase text-muted-foreground tracking-[0.2em] border-r border-border/20">
                            Task Instance
                        </div>
                        <div className="flex">
                            {months.map((month, i) => (
                                <div
                                    key={i}
                                    style={{ width: colWidth }}
                                    className="p-4 text-center font-black text-[9px] uppercase text-muted-foreground tracking-widest border-r border-border/10 last:border-r-0"
                                >
                                    {month.toLocaleDateString("en-US", { month: "long" })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grid Body */}
                    <div className="divide-y divide-border/10">
                        {tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30">
                                <Clock className="h-10 w-10 mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No scheduling data available</p>
                            </div>
                        ) : (
                            tasks.map(task => {
                                // Calculate position
                                const start = task.startDate ? new Date(task.startDate) : new Date(task.createdAt);
                                const end = task.dueDate ? new Date(task.dueDate) : new Date(new Date(task.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000);

                                // Days from timeline start
                                const diffStart = (start.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
                                const diffEnd = (end.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);

                                // Day width = colWidth / 30 (approx)
                                const dayWidth = colWidth / 30;
                                const left = diffStart * dayWidth;
                                const width = Math.max(80, (diffEnd - diffStart) * dayWidth);

                                return (
                                    <div key={task.id} className="flex group hover:bg-primary/[0.02] transition-colors h-16 relative">
                                        {/* Task Info Cell */}
                                        <div className="w-[280px] shrink-0 p-3 border-r border-border/20 flex items-center gap-3 bg-surface/10 z-[1]">
                                            <Avatar className="h-7 w-7 border-2 border-surface shadow-sm shrink-0">
                                                {task.assignee?.avatarUrl && <AvatarImage src={task.assignee.avatarUrl} />}
                                                <AvatarFallback className="text-[9px] bg-primary text-primary-foreground font-black">
                                                    {getInitials(task.assignee?.name || "U")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-bold truncate tracking-tight text-foreground/90 group-hover:text-primary transition-colors">
                                                    {task.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge className={cn(
                                                        "text-[7px] font-black uppercase px-1 h-3.5 border-none",
                                                        task.status === "DONE" ? "bg-green-500/10 text-green-500" :
                                                            task.status === "HALTED" ? "bg-destructive/10 text-destructive" :
                                                                "bg-primary/10 text-primary"
                                                    )}>
                                                        {task.status}
                                                    </Badge>
                                                    <span className="text-[8px] font-mono opacity-30">#{task.id.slice(-4)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Timeline Lane */}
                                        <div className="flex-1 relative flex items-center">
                                            {/* Grid Vertical Lines */}
                                            <div className="absolute inset-0 flex pointer-events-none">
                                                {months.map((_, i) => (
                                                    <div key={i} style={{ width: colWidth }} className="h-full border-r border-border/5 last:border-r-0" />
                                                ))}
                                            </div>

                                            {/* Task Bar */}
                                            <div
                                                onClick={() => onTaskClick?.(task)}
                                                className={cn(
                                                    "absolute h-8 rounded-lg border shadow-sm flex items-center px-1 transition-all hover:h-10 hover:z-10 cursor-pointer backdrop-blur-md group/bar",
                                                    task.status === "DONE" ? "bg-green-500/20 border-green-500/30" :
                                                        task.status === "HALTED" ? "bg-destructive/20 border-destructive/30" :
                                                            "bg-primary/10 border-primary/20 hover:bg-primary/20"
                                                )}
                                                style={{
                                                    left: Math.max(0, left),
                                                    width,
                                                    boxShadow: task.status === "DONE" ? '0 4px 12px rgba(34, 197, 94, 0.1)' : '0 4px 12px rgba(99, 102, 241, 0.1)'
                                                }}
                                            >
                                                {/* Progress Fill */}
                                                <div
                                                    className={cn(
                                                        "absolute inset-y-0 left-0 transition-all duration-700 opacity-20",
                                                        task.status === "DONE" ? "bg-green-500" : "bg-primary"
                                                    )}
                                                    style={{ width: task.status === "DONE" ? "100%" : "50%" }}
                                                />

                                                <div className="relative w-full flex items-center justify-between px-2">
                                                    <span className="text-[8px] font-black uppercase tracking-tighter text-foreground/80 truncate pr-2">
                                                        {task.status === "DONE" ? "100%" : "IN PROGRESS"}
                                                    </span>
                                                    {task.status === "DONE" ? (
                                                        <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                                                    ) : task.status === "HALTED" ? (
                                                        <AlertCircle className="h-3 w-3 text-destructive shrink-0" />
                                                    ) : (
                                                        <Clock className="h-3 w-3 text-primary/60 shrink-0" />
                                                    )}
                                                </div>

                                                {/* Hover Tooltip/Info (Visual only) */}
                                                <div className="absolute top-full left-0 mt-1 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-background border border-border shadow-xl rounded px-2 py-1 z-20 pointer-events-none whitespace-nowrap">
                                                    <p className="text-[7px] font-black uppercase text-muted-foreground">
                                                        {start.toLocaleDateString()} - {end.toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div className="h-8" /> {/* Bottom spacing */}
                    </div>
                </div>
                <ScrollBar orientation="horizontal" className="bg-primary/5" />
            </ScrollArea>

            {/* Sub-Footer Info */}
            <div className="p-3 bg-muted/5 border-t border-border/20 flex items-center justify-between shrink-0">
                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-[8px] font-black uppercase text-muted-foreground">Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-[8px] font-black uppercase text-muted-foreground">Complete</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-destructive" />
                        <span className="text-[8px] font-black uppercase text-muted-foreground">Blocked</span>
                    </div>
                </div>
                <p className="text-[8px] font-bold text-muted-foreground/40 uppercase italic">
                    Drag disabled in timeline view
                </p>
            </div>
        </div>
    );
}
