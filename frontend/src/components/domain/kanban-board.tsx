"use client";

import * as React from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation,
    useDroppable
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, LayoutGrid, BarChart2 } from "lucide-react";
import { TaskCard } from "./task-card";
import { TasksTimeline } from "./tasks-timeline";
import { Task, SystemStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { KanbanBoardSkeleton } from "@/components/shared/skeletons";

interface KanbanColumnProps {
    id: SystemStatus;
    title: string;
    tasks: Task[];
}

interface SortableTaskItemProps {
    task: Task;
}

function SortableTaskItem({ task }: SortableTaskItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
        disabled: task.isHalted,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="opacity-30 p-0">
                <TaskCard task={task} className="invisible" />
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard task={task} />
        </div>
    );
}

function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
        data: {
            type: "Column",
            column: { id, title },
        },
    });

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col w-full rounded-2xl bg-surface/40 border border-border/40 h-full min-h-0 backdrop-blur-md relative overflow-hidden"
        >
            <div className="flex items-center justify-between p-4 pb-2 shrink-0">
                <div className="flex items-center gap-2">
                    <h3 className={cn(
                        "font-black text-[11px] uppercase tracking-[0.2em]",
                        id === "TODO" && "text-blue-400",
                        id === "IN_PROGRESS" && "text-yellow-400",
                        id === "HALTED" && "text-destructive",
                        id === "DONE" && "text-green-400"
                    )}>
                        {title}
                    </h3>
                    <span className="bg-foreground/5 text-foreground/60 text-[10px] px-2 py-0.5 rounded-full font-black">
                        {tasks.length}
                    </span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 min-h-0">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3 min-h-[100px]">
                        {tasks.map((task) => (
                            <SortableTaskItem key={task.id} task={task} />
                        ))}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}

const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: "0.5",
            },
        },
    }),
};

export function KanbanBoard({
    initialTasks,
    isLoading = false
}: {
    initialTasks: Task[];
    isLoading?: boolean;
}) {
    const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
    const [activeTask, setActiveTask] = React.useState<Task | null>(null);
    const [viewMode, setViewMode] = React.useState<"board" | "gantt">("board");

    React.useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const columns: { id: SystemStatus; title: string }[] = [
        { id: "TODO", title: "To Do" },
        { id: "IN_PROGRESS", title: "In Progress" },
        { id: "HALTED", title: "Halted / Blocked" },
        { id: "DONE", title: "Completed" },
    ];

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        if (active.data.current?.type === "Task") {
            setActiveTask(active.data.current.task);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";
        const isOverColumn = over.data.current?.type === "Column";

        if (!isActiveTask) return;

        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                if (tasks[activeIndex].status !== tasks[overIndex].status) {
                    const updatedTasks = [...tasks];
                    updatedTasks[activeIndex] = { ...updatedTasks[activeIndex], status: tasks[overIndex].status };
                    return arrayMove(updatedTasks, activeIndex, overIndex);
                }

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const columnId = over.id as SystemStatus;

                if (tasks[activeIndex].status !== columnId) {
                    const updatedTasks = [...tasks];
                    updatedTasks[activeIndex] = { ...updatedTasks[activeIndex], status: columnId };
                    return updatedTasks;
                }
                return tasks;
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId !== overId) {
            setTasks((items) => {
                const oldIndex = items.findIndex((t) => t.id === activeId);
                const newIndex = items.findIndex((t) => t.id === overId);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    if (isLoading) {
        return <KanbanBoardSkeleton />;
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-[300px]">
                    <TabsList className="bg-surface/50 border border-border/50 grid grid-cols-2">
                        <TabsTrigger value="board" className="gap-2 font-bold uppercase text-[10px] italic">
                            <LayoutGrid className="h-3.5 w-3.5" />
                            Board
                        </TabsTrigger>
                        <TabsTrigger value="gantt" className="gap-2 font-bold uppercase text-[10px] italic">
                            <BarChart2 className="h-3.5 w-3.5" />
                            Timeline
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {viewMode === "board" ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex gap-4 h-full overflow-hidden">
                        {columns.map((col) => (
                            <div key={col.id} className="flex-1 min-w-0 max-w-[calc(25%-12px)] h-full">
                                <KanbanColumn
                                    id={col.id}
                                    title={col.title}
                                    tasks={tasks.filter((t) => t.status === col.id)}
                                />
                            </div>
                        ))}
                    </div>

                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeTask ? (
                            <div className="w-[320px] rotate-3">
                                <TaskCard task={activeTask} />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            ) : (
                <div className="flex-1 min-h-0">
                    <TasksTimeline tasks={tasks} />
                </div>
            )}
        </div>
    );
}
