"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function TaskCardSkeleton() {
    return (
        <Card className="bg-surface/50 border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-3 space-y-3">
                <div className="flex justify-between items-start gap-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-4 w-12 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <div className="flex items-center justify-between pt-1">
                    <div className="flex -space-x-2">
                        <Skeleton className="h-6 w-6 rounded-full border-2 border-background" />
                        <Skeleton className="h-6 w-6 rounded-full border-2 border-background" />
                    </div>
                    <Skeleton className="h-3 w-16 rounded" />
                </div>
            </CardContent>
        </Card>
    );
}

export function KanbanBoardSkeleton() {
    return (
        <div className="flex gap-6 h-full overflow-x-auto pb-6">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col w-[320px] rounded-lg bg-surface/80 border border-border/50 h-full backdrop-blur-sm">
                    <div className="flex items-center justify-between p-4 pb-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                    <div className="flex-1 p-3 space-y-3">
                        <TaskCardSkeleton />
                        <TaskCardSkeleton />
                        <TaskCardSkeleton />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function UserTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-full max-w-sm rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
            </div>
            <Card className="bg-surface/30 border-border overflow-hidden">
                <div className="p-0">
                    <div className="border-b border-border bg-accent/20 p-4 grid grid-cols-5 gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24 ml-auto" />
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="p-4 border-b border-border/50 grid grid-cols-5 gap-4 items-center">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                            <div className="flex justify-end">
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

export function GanttViewSkeleton() {
    return (
        <div className="flex flex-col h-full bg-surface/30 border border-border rounded-xl overflow-hidden">
            {/* Toolbar Skeleton */}
            <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-accent/10">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-32 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-48 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left side list skeleton */}
                <div className="w-80 border-r border-border shrink-0 flex flex-col">
                    <div className="h-10 border-b border-border bg-accent/5" />
                    <div className="flex-1 p-2 space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <div className="pl-4 space-y-2">
                                    <Skeleton className="h-3 w-1/2" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right side timeline skeleton */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="h-10 border-b border-border bg-accent/5 grid grid-cols-7 gap-px">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <Skeleton key={i} className="h-full w-full rounded-none" />
                        ))}
                    </div>
                    <div className="flex-1 relative p-4 space-y-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="relative h-6 w-full">
                                <Skeleton className="absolute h-full rounded-full" style={{ left: `${i * 10}%`, width: `${20 + i * 5}%` }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <Card className="bg-surface/50 border-border shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
            </CardContent>
        </Card>
    );
}
