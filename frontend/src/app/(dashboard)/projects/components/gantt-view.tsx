"use client";

import * as React from "react";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    Clock,
    User as UserIcon,
    AlertCircle,
    CheckCircle2,
    CalendarDays
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SystemStatus, Priority } from "@/types";
import api from "@/lib/api";
import { GanttViewSkeleton } from "@/components/shared/skeletons";

interface GanttViewProps {
    selectedUserIds?: string[];
    onTaskClick?: (task: any) => void;
}

interface TimelineItem {
    id: string;
    title: string;
    start: Date;
    end: Date;
    progress: number;
    type: "PROJECT" | "STORY" | "TASK";
    status: string;
    ownerId: string;
    assigneeId: string;
    stakeholderId: string;
}

import { projectService } from "@/services/project.service";
import { userService } from "@/services/user.service";
import { User } from "@/types";

export function GanttView({ selectedUserIds = [], onTaskClick }: GanttViewProps) {
    const [viewDate, setViewDate] = React.useState(new Date(2024, 2, 1));
    const [isLoading, setIsLoading] = React.useState(true);
    const [items, setItems] = React.useState<TimelineItem[]>([]);
    const [users, setUsers] = React.useState<User[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [projects, userData] = await Promise.all([
                    projectService.getTimeline(selectedUserIds.length > 0 ? selectedUserIds : undefined),
                    userService.getUsers()
                ]);

                setUsers(userData as any);

                const flattened: TimelineItem[] = [];

                projects.forEach((p: any) => {
                    // Project Bar
                    flattened.push({
                        id: p.id,
                        title: p.name,
                        start: p.startDate ? new Date(p.startDate) : new Date(p.createdAt),
                        end: p.endDate ? new Date(p.endDate) : new Date(new Date(p.createdAt).getTime() + 14 * 24 * 60 * 60 * 1000),
                        progress: 0,
                        type: "PROJECT",
                        status: p.status,
                        ownerId: p.ownerId,
                        assigneeId: p.ownerId,
                        stakeholderId: p.stakeholderId
                    });

                    p.stories?.forEach((s: any) => {
                        // Story Bar
                        flattened.push({
                            id: s.id,
                            title: s.title,
                            start: s.createdAt ? new Date(s.createdAt) : new Date(),
                            end: new Date(new Date(s.createdAt || Date.now()).getTime() + 7 * 24 * 60 * 60 * 1000),
                            progress: 0,
                            type: "STORY",
                            status: s.status,
                            ownerId: p.ownerId,
                            assigneeId: p.ownerId,
                            stakeholderId: p.stakeholderId
                        });

                        s.tasks?.forEach((t: any) => {
                            flattened.push({
                                id: t.id,
                                title: t.title,
                                start: t.createdAt ? new Date(t.createdAt) : new Date(),
                                end: t.dueDate ? new Date(t.dueDate) : new Date(new Date(t.createdAt || Date.now()).getTime() + 3 * 24 * 60 * 60 * 1000),
                                progress: t.status === "DONE" ? 100 : t.status === "IN_PROGRESS" ? 50 : 0,
                                type: "TASK",
                                status: t.status,
                                ownerId: p.ownerId,
                                assigneeId: t.assigneeId,
                                stakeholderId: p.stakeholderId
                            });
                        });
                    });
                });
                setItems(flattened);
            } catch (error) {
                console.error("Gantt fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [selectedUserIds]);

    const filteredItems = items;

    // Timeline Rendering Constants
    const months = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
    const colWidth = 120; // px per month

    if (isLoading) {
        return <GanttViewSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/30 backdrop-blur-md p-4 rounded-2xl border border-border/30">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Timeline View</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Enterprise Roadmap</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-muted/20 p-1.5 rounded-xl border border-border/10">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2 px-3 py-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">March 2024 - August 2024</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card className="bg-surface border-border overflow-hidden">
                <CardHeader className="border-b border-border/50 py-3 bg-muted/20">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            Initiative Roadmap
                        </CardTitle>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tighter bg-primary/5 text-primary border-primary/20">
                            {filteredItems.length} active items
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto scrollbar-hide">
                    <div className="min-w-[800px]">
                        {/* Timeline Header */}
                        <div className="flex border-b border-border/30">
                            <div className="w-[280px] shrink-0 p-4 font-bold text-[10px] uppercase text-muted-foreground tracking-widest border-r border-border/30">
                                Item Name / Context
                            </div>
                            <div className="flex-1 flex">
                                {months.map(month => (
                                    <div key={month} style={{ width: colWidth }} className="p-4 text-center font-bold text-[10px] uppercase text-muted-foreground tracking-widest border-r border-border/10 last:border-r-0">
                                        {month}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Timeline Body */}
                        <div className="divide-y divide-border/10">
                            {filteredItems.length === 0 ? (
                                <div className="p-20 text-center">
                                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                                    <h4 className="text-sm font-bold opacity-50 italic">No timeline items for this role</h4>
                                </div>
                            ) : (
                                filteredItems.map(item => {
                                    // Math for bar position (Simplified for mock range Mar-Aug)
                                    const startMonth = item.start.getMonth(); // 2 is March
                                    const endMonth = item.end.getMonth();
                                    const leftOffset = (startMonth - 2) * colWidth + (item.start.getDate() / 30) * colWidth;
                                    const barWidth = (endMonth - startMonth) * colWidth + (item.end.getDate() / 30) * colWidth;

                                    return (
                                        <div key={item.id} className="flex hover:bg-accent/5 transition-colors group relative">
                                            <div className="w-[280px] shrink-0 p-4 border-r border-border/30 flex flex-col gap-1.5 justify-center bg-surface/20">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest p-0 px-2 h-4 border-none",
                                                        item.type === "PROJECT" ? "bg-primary text-primary-foreground" :
                                                            item.type === "STORY" ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
                                                    )}>
                                                        {item.type}
                                                    </Badge>
                                                    <span className="text-[11px] font-bold truncate group-hover:text-primary transition-colors tracking-tight">{item.title}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] text-muted-foreground pl-[64px] font-medium uppercase tracking-widest opacity-60">
                                                    <UserIcon className="h-2.5 w-2.5" />
                                                    <span>{users.find((u: any) => u.id === item.assigneeId)?.name || "Unassigned"}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 relative h-16 flex items-center overflow-hidden">
                                                {/* Grid Lines */}
                                                <div className="absolute inset-0 flex">
                                                    {months.map(m => (
                                                        <div key={m} style={{ width: colWidth }} className="h-full border-r border-border/5 last:border-r-0" />
                                                    ))}
                                                </div>

                                                {/* The Gantt Bar */}
                                                <div
                                                    onClick={() => onTaskClick?.(item)}
                                                    className={cn(
                                                        "absolute h-7 rounded-lg border shadow-lg flex items-center px-1 group/bar transition-all hover:h-9 hover:z-10 cursor-pointer overflow-hidden backdrop-blur-sm",
                                                        item.status === "DONE" ? "bg-success/20 border-success/30" :
                                                            item.status === "HALTED" ? "bg-destructive/20 border-destructive/30" :
                                                                "bg-primary/10 border-primary/20 hover:bg-primary/20"
                                                    )}
                                                    style={{
                                                        left: Math.max(0, leftOffset),
                                                        width: Math.max(60, barWidth),
                                                        boxShadow: `0 4px 12px ${item.status === "DONE" ? "rgba(34, 197, 94, 0.1)" : "rgba(var(--primary), 0.1)"}`
                                                    }}
                                                >
                                                    {/* Progress Fill */}
                                                    <div
                                                        className={cn(
                                                            "absolute inset-y-0 left-0 transition-all duration-1000 opacity-30",
                                                            item.status === "DONE" ? "bg-success" : "bg-primary"
                                                        )}
                                                        style={{ width: `${item.progress}%` }}
                                                    />

                                                    {/* Stripe Pattern for Halted */}
                                                    {item.status === "HALTED" && (
                                                        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_20px)]" />
                                                    )}

                                                    <div className="relative w-full flex items-center justify-between px-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1 w-1 rounded-full bg-blue-400 animate-pulse" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-foreground/80 truncate">
                                                                {item.progress}%
                                                            </span>
                                                        </div>
                                                        {item.status === "DONE" && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                                                        {item.status === "HALTED" && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
