"use client";

import * as React from "react";
import {
    AlertCircle,
    Clock,
    MessageSquare,
    Paperclip,
    User as UserIcon
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, getInitials } from "@/lib/utils";
import { Task, Priority } from "@/types";

interface TaskCardProps {
    task: Task;
    onSelect?: (task: Task) => void;
    className?: string;
    isDragging?: boolean;
}

/**
 * Priority color mapping for badges.
 */
const priorityStyles: Record<Priority, string> = {
    LOW: "text-muted-foreground border-muted",
    MEDIUM: "text-primary border-primary/30",
    HIGH: "text-orange-400 border-orange-400/30",
    CRITICAL: "bg-destructive/10 text-destructive border-destructive",
};

/**
 * TaskCard Component.
 * Displays task details with specialized "HALTED" visual state.
 * Includes diagonal stripe background and red borders when blocked.
 * 
 * @param task - The task object.
 * @param isDragging - Prop from DnD library to handle dragging state visuals.
 */
export function TaskCard({ task, onSelect, className, isDragging }: TaskCardProps) {
    return (
        <TooltipProvider>
            <Card
                onClick={() => !task.isHalted && onSelect?.(task)}
                className={cn(
                    "bg-surface border-border select-none transition-shadow",
                    task.isHalted && "border-destructive/50 cursor-not-allowed opacity-90",
                    !task.isHalted && "cursor-grab active:cursor-grabbing hover:shadow-md hover:border-primary/50",
                    isDragging && "shadow-2xl opacity-50 ring-2 ring-primary",
                    className
                )}
            >
                {/* Halted Overlay - Removed Stripes */}

                <CardHeader className="p-3 pb-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap gap-1">
                            {task.project && (
                                <Link href={`/projects/${task.project.id}`}>
                                    <Badge variant="secondary" className="text-[8px] px-1.5 h-4 font-mono uppercase bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 cursor-pointer transition-all">
                                        PRJ: {task.project.name}
                                    </Badge>
                                </Link>
                            )}
                        </div>

                        {task.isHalted && (
                            <Tooltip>
                                <TooltipTrigger>
                                    <AlertCircle className="h-4 w-4 text-destructive animate-pulse" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-destructive border-none text-white font-bold text-[10px] uppercase">
                                    Halted: blocked by dependency
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                    <CardTitle className="text-sm font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">
                        {task.title}
                    </CardTitle>
                    {task.story && (
                        <Link href={`/projects/stories/${task.story.id}`}>
                            <div className="text-[9px] font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer truncate flex items-center gap-1">
                                <span className="text-primary/40">US:</span> {task.story.title}
                            </div>
                        </Link>
                    )}
                </CardHeader>

                <CardContent className="p-3 pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-[9px] text-muted-foreground uppercase font-bold tracking-tight">
                        <div className="flex items-center gap-1 bg-accent/30 p-1 rounded">
                            <Clock className="h-2.5 w-2.5 text-primary/50" />
                            <div className="flex flex-col">
                                <span className="text-[7px] opacity-50">Start</span>
                                <span>{task.startDate ? new Date(task.startDate).toLocaleDateString([], { month: 'short', day: '2-digit' }) : 'ASAP'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-accent/30 p-1 rounded">
                            <AlertCircle className="h-2.5 w-2.5 text-orange-400/50" />
                            <div className="flex flex-col">
                                <span className="text-[7px] opacity-50">Due</span>
                                <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: '2-digit' }) : 'TBD'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                            {(task.assignees || (task.assignee ? [task.assignee] : [])).map((u) => (
                                <Tooltip key={u.id}>
                                    <TooltipTrigger asChild>
                                        <Avatar className="h-7 w-7 border-2 border-surface shadow-sm">
                                            {u.avatarUrl && <AvatarImage src={u.avatarUrl} />}
                                            <AvatarFallback className="text-[10px] bg-primary text-primary-foreground font-black italic">
                                                {getInitials(u.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs font-bold">{u.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                        <span className="text-[10px] font-mono opacity-40">#{task.id.split("-")[1]}</span>
                    </div>
                </CardContent>

                {task.isHalted && (
                    <div className="bg-destructive/10 px-3 py-1.5 border-t border-destructive/20 rounded-b-[inherit]">
                        <p className="text-[9px] font-bold text-destructive uppercase italic tracking-wider">
                            Ready to Resume when &quot;API Spec&quot; resolves
                        </p>
                    </div>
                )}
            </Card>
        </TooltipProvider>
    );
}
