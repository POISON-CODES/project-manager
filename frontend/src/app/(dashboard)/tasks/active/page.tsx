"use client";

import * as React from "react";
import { CheckSquare, Search, Filter, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { taskService } from "@/services/project.service";
import { Task } from "@/types";
import { TaskCard } from "@/components/domain/task-card";
import { TaskDetailDialog } from "@/components/shared/task-detail-dialog";
import { FeatureGuard } from "@/components/shared/feature-guard";

/**
 * Active Tasks Page.
 * Displays all tasks across the organization that are not yet COMPLETED.
 */
export default function ActiveTasksPage() {
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    React.useEffect(() => {
        const fetchActiveTasks = async () => {
            try {
                const allTasks = await taskService.getTasks();
                // Filter out DONE tasks
                const active = allTasks.filter(t => t.status !== 'DONE');
                setTasks(active);
            } catch (err) {
                console.error("Failed to fetch active tasks:", err);
            } finally {
                setTimeout(() => setIsLoading(false), 300);
            }
        };

        fetchActiveTasks();
    }, []);

    const filteredTasks = tasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsDialogOpen(true);
    };

    return (
        <FeatureGuard feature="TASKS">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-3">
                            <CheckSquare className="h-8 w-8 text-success" />
                            Active Tasks
                        </h1>
                        <p className="text-muted-foreground leading-relaxed">Consolidated view of all work-in-progress and pending actions.</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                        <Input
                            placeholder="Search active tasks..."
                            className="pl-9 bg-surface/50 border-border/50 h-10 rounded-xl focus:bg-surface transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-10 gap-2 border-border/50 rounded-xl bg-surface/50 hover:bg-surface transition-all px-4 group">
                        <Filter className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Filters</span>
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <Skeleton key={i} className="h-32 rounded-xl bg-surface/50 border border-border/50" />
                        ))}
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <Card className="bg-surface/30 border-border border-dashed py-32 rounded-3xl">
                        <div className="flex flex-col items-center justify-center text-center px-6">
                            <div className="p-5 bg-muted/20 rounded-full mb-6 border border-border/50">
                                <CheckSquare className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight">Zero Active Tasks</h3>
                            <p className="text-muted-foreground max-w-sm mt-2 text-sm">
                                Outstanding work has been cleared. All tracks are currently at baseline.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onSelect={handleTaskClick}
                            />
                        ))}
                    </div>
                )}

                <TaskDetailDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    task={selectedTask}
                />
            </div>
        </FeatureGuard>
    );
}
