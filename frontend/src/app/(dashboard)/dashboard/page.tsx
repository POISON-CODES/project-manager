"use client";

import { useEffect, useState } from "react";
import {
    FolderKanban,
    CheckSquare,
    AlertCircle,
    TrendingUp,
    ArrowRight,
    Loader2,
    Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { projectService, taskService } from "@/services/project.service";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { calendarService } from "@/services/calendar.service";
import { Project, Task, User, Activity, UserCapacity } from "@/types";
import { StatCard } from "@/components/domain/stat-card";
import { ActivityItem } from "@/components/domain/activity-item";
import { Skeleton } from "@/components/ui/skeleton";
import { FeatureGuard } from "@/components/shared/feature-guard";

/**
 * Dashboard Overview Page.
 * Displays high-level metrics and recent system activity.
 * 
 * @returns JSX for the dashboard overview.
 */
export default function DashboardPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [capacities, setCapacities] = useState<UserCapacity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projData, taskData, activityData, userData, allUsers] = await Promise.all([
                    projectService.getProjects(),
                    taskService.getTasks(),
                    userService.getActivity(),
                    authService.getSession(),
                    userService.getUsers()
                ]);

                setProjects(projData);
                setTasks(taskData);
                setActivities(activityData);
                setCurrentUser(userData);

                // Fetch real capacity for all users
                const userIds = allUsers.map(u => u.id);
                if (userIds.length > 0) {
                    const capData = await calendarService.getTeamCapacity(userIds, new Date().toISOString());
                    setCapacities(capData);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                // Subtle delay for smoother transition
                setTimeout(() => setIsLoading(false), 300);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    // Calculate Stats
    const activeProjectsCount = projects.filter(p => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS').length;
    const pendingTasksCount = tasks.filter(t => t.status !== 'DONE').length;
    const haltedItemsCount = projects.filter(p => p.status === 'HALTED').length + tasks.filter(t => t.status === 'HALTED').length;

    // Task distribution for the progress bar
    const taskStats = {
        low: tasks.filter(t => t.priority === 'LOW').length,
        medium: tasks.filter(t => t.priority === 'MEDIUM').length,
        high: tasks.filter(t => t.priority === 'HIGH').length,
        critical: tasks.filter(t => t.priority === 'CRITICAL').length,
        total: tasks.length || 1
    };

    return (
        <FeatureGuard feature="DASHBOARD">
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Overview
                    </h1>
                    <p className="text-muted-foreground">
                        Welcome back, <span className="text-foreground font-bold">{currentUser?.name?.split(' ')[0] || 'User'}</span>. Here&apos;s your system snapshot.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Link href="/projects/active" className="block">
                        <StatCard
                            title="Active Projects"
                            value={activeProjectsCount.toString()}
                            description="Projects currently in progress"
                            icon={FolderKanban}
                            color="text-primary"
                        />
                    </Link>
                    <Link href="/tasks/active" className="block">
                        <StatCard
                            title="Tasks Pending"
                            value={pendingTasksCount.toString()}
                            description="Tasks requiring attention"
                            icon={CheckSquare}
                            color="text-success"
                        />
                    </Link>
                    <StatCard
                        title="HALTED Items"
                        value={haltedItemsCount.toString()}
                        description="Items blocking progress"
                        icon={AlertCircle}
                        color="text-destructive"
                    />
                    <StatCard
                        title="Team Capacity"
                        value={`${capacities.length > 0
                            ? Math.round(capacities.reduce((sum, c) => sum + c.capacityPercent, 0) / capacities.length)
                            : 0
                            }%`}
                        icon={TrendingUp}
                        color="text-primary"
                        tooltip="Average bandwidth utilized across all team members today (8h workday base)."
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* Recent Activity */}
                    <Card className="col-span-4 bg-surface border-border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>System-wide actions and updates.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {activities.length > 0 ? (
                                    activities.slice(0, 5).map((activity) => (
                                        <ActivityItem key={activity.id} activity={activity} />
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground italic text-sm bg-muted/10 rounded-lg border border-dashed border-border">
                                        No recent activity found.
                                    </div>
                                )}
                            </div>
                            {activities.length > 0 && (
                                <Button variant="outline" className="w-full mt-6 border-border hover:bg-background h-10 font-bold text-xs uppercase tracking-widest">
                                    View Full Audit Log
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions / Halted Alert */}
                    <div className="col-span-3 space-y-6">
                        <Card className="bg-surface border-border shadow-sm border-l-4 border-l-destructive">
                            <CardHeader>
                                <CardTitle className="text-destructive flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5" />
                                    Critical Attention
                                </CardTitle>
                                <CardDescription>Items blocking pipeline progress.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {tasks.filter(t => t.status === 'HALTED').slice(0, 2).map(task => (
                                    <div key={task.id} className="p-4 rounded-md border border-destructive/20 bg-destructive/5 space-y-3 group hover:bg-destructive/10 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold uppercase tracking-tight block truncate max-w-[180px]">{task.title}</span>
                                                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                                    {task.description || "This task is currently halted and requires intervention."}
                                                </p>
                                            </div>
                                            <Badge variant="destructive" className="animate-pulse text-[8px] px-1 h-4 font-black">HALTED</Badge>
                                        </div>
                                        <Button size="sm" variant="destructive" className="w-full font-bold text-[10px] h-8 uppercase tracking-widest shadow-lg shadow-destructive/20">
                                            Resolve Conflict
                                        </Button>
                                    </div>
                                ))}

                                {tasks.filter(t => t.status === 'HALTED').length === 0 && (
                                    <div className="p-8 rounded-lg border border-dashed border-border bg-accent/5 text-center flex flex-col items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                                            <CheckSquare className="h-4 w-4 text-success" />
                                        </div>
                                        <p className="text-xs text-muted-foreground italic">No currently halted items.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-surface border-border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button asChild variant="secondary" className="w-full justify-between group h-11 text-xs font-bold px-4">
                                    <Link href="/projects/queue">
                                        <span className="flex items-center gap-3"><FolderKanban className="h-4 w-4 text-primary" /> Claim New Project</span>
                                        <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all font-bold" />
                                    </Link>
                                </Button>
                                <Button asChild variant="secondary" className="w-full justify-between group h-11 text-xs font-bold px-4">
                                    <Link href="/workflows">
                                        <span className="flex items-center gap-3"><TrendingUp className="h-4 w-4 text-success" /> New Automation</span>
                                        <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all font-bold" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </FeatureGuard>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="space-y-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 space-y-4">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                </div>
                <div className="col-span-3 space-y-6">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
