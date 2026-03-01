"use client";

import * as React from "react";
import {
    LayoutList,
    MoreVertical,
    Plus,
    Search,
    ChevronRight,
    Loader2,
    Clock,
    PlayCircle,
    CheckCircle2,
    BarChart3,
    AlertCircle,
    Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Priority, ProjectStage } from "@/types";
import { projectService, storyService, taskService } from "@/services/project.service";

type KanbanLevel = "PROJECTS" | "STORIES" | "TASKS";

interface KanbanCard {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority?: Priority;
    assignee?: { id: string; name: string; avatarUrl?: string };
    meta?: {
        tasksCount?: number;
        completedCount?: number;
        comments?: number;
        attachments?: number;
        project?: string;
    };
    raw?: any;
}

interface KanbanViewProps {
    level: KanbanLevel;
    onLevelChange: (level: KanbanLevel) => void;
    selectedUserIds?: string[];
    onTaskClick?: (task: any) => void;
}

const DEFAULT_PROJECT_COLUMNS = [
    { id: "Project Submitted", label: "Intake", color: "bg-blue-500/5 border-blue-500/20", icon: Clock },
    { id: "Discovery", label: "Discovery", color: "bg-indigo-500/5 border-indigo-500/20", icon: Search },
    { id: "Estimation", label: "Estimation", color: "bg-amber-500/5 border-amber-500/20", icon: BarChart3 },
    { id: "Execution", label: "Execution", color: "bg-emerald-500/5 border-emerald-500/20", icon: PlayCircle },
    { id: "Audit", label: "Audit", color: "bg-purple-500/5 border-purple-500/20", icon: CheckCircle2 }
];

const TASK_COLUMNS = [
    { id: "TODO", label: "To Do", color: "bg-surface border-muted", icon: Clock },
    { id: "IN_PROGRESS", label: "In Progress", color: "bg-primary/5 border-primary/20", icon: PlayCircle },
    { id: "DONE", label: "Completed", color: "bg-success/5 border-success/20", icon: CheckCircle2 },
    { id: "HALTED", label: "Halted", color: "bg-red-500/5 border-red-500/20", icon: CheckCircle2 }
];

const STORY_COLUMNS = [
    { id: "BACKLOG", label: "Backlog", color: "bg-surface border-muted", icon: LayoutList },
    { id: "READY", label: "Ready", color: "bg-blue-500/5 border-blue-500/20", icon: ChevronRight },
    { id: "IN_PROGRESS", label: "In Progress", color: "bg-primary/5 border-primary/20", icon: PlayCircle },
    { id: "DONE", label: "Done", color: "bg-success/5 border-success/20", icon: CheckCircle2 }
];

export function KanbanView({
    level,
    selectedUserIds = [],
    onTaskClick
}: KanbanViewProps) {
    const [data, setData] = React.useState<KanbanCard[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [projectStages, setProjectStages] = React.useState<ProjectStage[]>([]);

    const activeColumns = React.useMemo(() => {
        if (level === "PROJECTS") {
            if (projectStages.length > 0) {
                return projectStages.map(stage => {
                    const fallback = DEFAULT_PROJECT_COLUMNS.find(c => c.id === stage.name) || DEFAULT_PROJECT_COLUMNS[0];
                    return {
                        id: stage.name,
                        label: stage.name,
                        color: stage.color ? `bg-${stage.color}-500/5 border-${stage.color}-500/20` : fallback.color,
                        icon: fallback.icon || Clock
                    };
                });
            }
            return DEFAULT_PROJECT_COLUMNS;
        }
        if (level === "STORIES") return STORY_COLUMNS;
        return TASK_COLUMNS;
    }, [level, projectStages]);

    React.useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                let cards: KanbanCard[] = [];
                if (level === "PROJECTS") {
                    const [projects, stages] = await Promise.all([
                        projectService.getProjects(),
                        projectService.getStages()
                    ]);
                    setProjectStages(stages);
                    cards = projects.map(p => ({
                        id: p.id,
                        title: p.name,
                        description: p.description,
                        status: p.currentStage?.name || "Project Submitted",
                        assignee: p.owner ? { id: p.owner.id, name: p.owner.name, avatarUrl: p.owner.avatarUrl } : undefined,
                        meta: p.taskStats ? {
                            tasksCount: p.taskStats.total,
                            completedCount: p.taskStats.total - (p.taskStats.low + p.taskStats.medium + p.taskStats.high + p.taskStats.critical)
                        } : undefined,
                        raw: p
                    }));
                } else if (level === "STORIES") {
                    const stories = await storyService.getStories();
                    cards = stories.map(s => ({
                        id: s.id,
                        title: s.title,
                        description: s.description,
                        status: s.status,
                        meta: {
                            tasksCount: s.tasks?.length || 0,
                            completedCount: s.tasks?.filter(t => t.status === 'DONE').length || 0
                        },
                        raw: s
                    }));
                } else {
                    const tasks = await taskService.getTasks();
                    cards = tasks.map(t => ({
                        id: t.id,
                        title: t.title,
                        description: t.description,
                        status: t.status,
                        priority: t.priority,
                        assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.name, avatarUrl: t.assignee.avatarUrl } : undefined,
                        raw: t
                    }));
                }
                setData(cards);
            } catch (error) {
                console.error(`Failed to fetch ${level}:`, error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [level]);

    const filteredData = selectedUserIds.length === 0
        ? data
        : data.filter(item => item.assignee && selectedUserIds.includes(item.assignee.id));

    const PriorityBadge = ({ priority }: { priority?: Priority }) => {
        if (!priority) return null;
        const styles = {
            LOW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
            MEDIUM: "bg-green-500/10 text-green-500 border-green-500/20",
            HIGH: "bg-orange-500/10 text-orange-500 border-orange-500/20",
            CRITICAL: "bg-red-500/10 text-red-500 border-red-500/20",
        };
        return (
            <Badge variant="outline" className={cn("text-[8px] font-black tracking-widest uppercase px-1.5 h-4", styles[priority])}>
                {priority}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
            </div>
        );
    }

    return (
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar h-full">
            {activeColumns.map((column: any) => {
                const ColumnIcon = column.icon;
                const columnItems = filteredData.filter(i => i.status === column.id);

                return (
                    <div key={column.id} className="flex-1 min-w-[320px] max-w-[360px] animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2.5">
                                <div className={cn("p-1.5 rounded-lg", column.color.replace('bg-', 'bg-').split(' ')[0])}>
                                    <ColumnIcon className="h-3.5 w-3.5" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.15em] italic">{column.label}</h3>
                                <Badge variant="secondary" className="bg-surface/80 border border-border/50 py-0 h-4 px-1.5 font-mono text-[9px] font-black">
                                    {columnItems.length}
                                </Badge>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-30 hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className={cn("rounded-3xl border p-2 space-y-3 flex-1 transition-all duration-500 shadow-sm overflow-y-auto custom-scrollbar-thin", column.color)}>
                            {columnItems.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => onTaskClick?.(item.raw)}
                                    className="bg-card/90 backdrop-blur-md rounded-2xl p-4 border border-border/40 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all hover:-translate-y-1 hover:border-primary/40 cursor-pointer group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {item.priority && <PriorityBadge priority={item.priority} />}
                                            {level === "TASKS" && item.raw?.project?.name && (
                                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[8px] font-black uppercase tracking-widest px-1.5 h-4 italic">
                                                    {item.raw.project.name}
                                                </Badge>
                                            )}
                                        </div>

                                        <h4 className="text-xs font-black leading-tight tracking-tight group-hover:text-primary transition-colors pr-4 uppercase">
                                            {item.title}
                                        </h4>

                                        {item.description && (
                                            <p className="text-[9px] text-muted-foreground line-clamp-2 leading-relaxed italic font-medium opacity-70">
                                                {item.description}
                                            </p>
                                        )}

                                        <div className="pt-2.5 flex items-center justify-between border-t border-border/10 mt-2">
                                            <div className="flex -space-x-2">
                                                {item.assignee && (
                                                    <div className="h-6 w-6 rounded-full border-2 border-background bg-accent flex items-center justify-center overflow-hidden ring-2 ring-transparent group-hover:ring-primary/10 transition-all" title={item.assignee.name}>
                                                        {item.assignee.avatarUrl ? (
                                                            <img src={item.assignee.avatarUrl} alt={item.assignee.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="bg-indigo-500 text-white text-[8px] font-black w-full h-full flex items-center justify-center italic">
                                                                {item.assignee.name.slice(0, 2).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {item.meta?.tasksCount !== undefined && (
                                                    <div className="flex items-center gap-1 text-[9px] font-black text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded-md">
                                                        <LayoutList className="h-2.5 w-2.5" />
                                                        <span className="tabular-nums">{item.meta.completedCount}/{item.meta.tasksCount}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
