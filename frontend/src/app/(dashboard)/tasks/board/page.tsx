"use client";

import { KanbanBoard } from "@/components/domain/kanban-board";
import { Task } from "@/types";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { FeatureGuard } from "@/components/shared/feature-guard";

/**
 * Tasks Board Page.
 * Host for the Kanban Board component.
 * 
 * @returns JSX for the tasks board.
 */
export default function TasksBoardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true);
            try {
                const res = await api.get("/tasks");
                if (res.data.success) {
                    setTasks(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch tasks", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, []);

    return (
        <FeatureGuard feature="TASKS">
            <div className="h-[calc(100vh-6.5rem)] flex flex-col gap-4 overflow-hidden">
                <div className="shrink-0 px-1">
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic text-foreground opacity-90">Kanban Board</h1>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Manage and drag tasks through the workflow columns.</p>
                </div>

                <div className="flex-1 min-h-0">
                    <KanbanBoard initialTasks={tasks} isLoading={isLoading} />
                </div>
            </div>
        </FeatureGuard>
    );
}
