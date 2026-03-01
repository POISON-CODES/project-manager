"use client";

import * as React from "react";
import {
    CheckCircle2,
    Clock,
    Filter,
    Search,
    MoreHorizontal,
    Calendar,
    CheckSquare,
    ChevronRight,
    Star,
    FolderKanban,
    Loader2,
    AlertCircle
} from "lucide-react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Task } from "@/types";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { FeatureGuard } from "@/components/shared/feature-guard";

export default function MyTasksPage() {
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [search, setSearch] = React.useState("");

    React.useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await api.get("/tasks");
                if (response.data.success) {
                    setTasks(response.data.data);
                }
            } catch (error) {
                toast.error("Failed to fetch your tasks.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const filteredTasks = tasks.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.project?.name.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: tasks.length,
        inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
        todo: tasks.filter(t => t.status === "TODO").length,
        done: tasks.filter(t => t.status === "DONE").length
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    return (
        <FeatureGuard feature="TASKS">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-6.5rem)] flex flex-col overflow-hidden">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                    <div className="px-1">
                        <h1 className="text-3xl font-black tracking-tighter uppercase italic text-foreground opacity-90">
                            My Tasks
                        </h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mt-1">
                            <CheckSquare className="h-3 w-3 text-primary/60" />
                            Focus on what matters most today.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2 border-border/50 bg-surface/50 font-bold uppercase text-[10px] italic">
                            <Filter className="h-3.5 w-3.5" /> Filter
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                    {[
                        { label: "Total Active", value: stats.total, color: "text-foreground" },
                        { label: "In Progress", value: stats.inProgress, color: "text-yellow-400" },
                        { label: "Pending", value: stats.todo, color: "text-blue-400" },
                        { label: "Completed", value: stats.done, color: "text-green-400" }
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-surface/30 backdrop-blur-md border border-border/30 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-4">
                                <div className={cn("text-2xl font-black italic", stat.color)}>{stat.value}</div>
                                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.15em] mt-1">{stat.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="flex gap-4 items-center bg-surface/30 px-3 py-2 rounded-xl border border-border/20 shrink-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                        <Input
                            placeholder="SEARCH TASKS OR PROJECTS..."
                            className="pl-10 bg-transparent border-none focus-visible:ring-0 font-black uppercase italic text-[10px] placeholder:text-muted-foreground/30"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tasks List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                            <div
                                key={task.id}
                                className="group relative bg-surface/40 border border-border/30 rounded-2xl p-4 hover:border-primary/40 hover:bg-surface/60 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="mt-1">
                                            <button className="h-5 w-5 rounded-md border-2 border-border/50 flex items-center justify-center hover:border-primary hover:text-primary transition-all">
                                                <CheckCircle2 className="h-3 w-3 opacity-0 hover:opacity-100" />
                                            </button>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors uppercase italic">{task.title}</h3>
                                                <Badge variant="outline" className="text-[8px] px-1.5 h-4 font-mono uppercase bg-primary/5 border-primary/20">
                                                    {task.priority}
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground/60 line-clamp-1 italic font-medium">#{task.id.split("-")[1]}</p>

                                            <div className="flex items-center gap-4 pt-2">
                                                {task.project && (
                                                    <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-black uppercase tracking-wider">
                                                        <FolderKanban className="h-3 w-3 text-primary/40" /> {task.project.name}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-black uppercase tracking-wider">
                                                    <Calendar className="h-3 w-3 text-primary/40" />
                                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: '2-digit' }) : 'ASAP'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-black uppercase tracking-wider">
                                                    <Star className="h-3 w-3 text-primary/40" /> {task.status.replace('_', ' ')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-surface/10 rounded-3xl border border-dashed border-border/20">
                            <AlertCircle className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                            <h3 className="font-black uppercase italic text-sm">No Tasks Found</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                                Your workspace is clear or refinement needed.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </FeatureGuard>
    );
}
