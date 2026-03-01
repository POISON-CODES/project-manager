"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    BarChart3,
    Target,
    CheckCircle2,
    Clock,
    Calendar,
    Mail,
    Phone,
    User as UserIcon,
    Shield,
    TrendingUp,
    Activity as ActivityIcon,
    Layout,
    Briefcase,
    ChevronRight,
    Loader2,
    PieChart as PieChartIcon
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { userService } from "@/services/user.service";
import { getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";

export default function UserStatsPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params as { id: string };

    const [data, setData] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const statsData = await userService.getUserStats(id);
                setData(statsData);
            } catch (err) {
                toast.error("Failed to load operative analytics");
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchStats();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background/50 backdrop-blur-md">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Syncing Neural Stats...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col h-[60vh] items-center justify-center bg-surface/30 backdrop-blur-md rounded-[3rem] border border-border/50 m-8">
                <div className="h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center mb-6">
                    <Shield className="h-10 w-10 text-destructive" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-2">Operative Asset Not Found</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8">The requested personnel profile could not be retrieved from the central database.</p>
                <Button
                    onClick={() => router.push('/admin/settings')}
                    className="font-black text-[10px] uppercase tracking-widest gap-2"
                >
                    <ArrowLeft className="h-3.5 w-3.5" /> Return to Personnel Oversight
                </Button>
            </div>
        );
    }

    const {
        user = {},
        stats = { taskStatusDistribution: {}, totalTasks: 0, completedTasks: 0, taskEfficiency: 0, involvedProjectsCount: 0, projectTally: { total: 0 } },
        recentActivity = [],
        assignedTasks = [],
        projects = []
    } = data;

    return (
        <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header / Profile Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-surface/30 backdrop-blur-md p-8 shadow-2xl shadow-primary/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />

                <div className="relative flex flex-col md:flex-row gap-8 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div
                            className="p-3 rounded-2xl bg-muted/10 hover:bg-primary/10 transition-colors cursor-pointer border border-border/50 shadow-sm"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </div>
                        <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                                    {user.name}
                                </h1>
                                <Badge className={cn(
                                    "text-[10px] font-black tracking-widest px-3 h-6",
                                    user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-primary/10 text-primary border-primary/20'
                                )}>
                                    {user.role}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-muted-foreground italic">
                                <span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-primary" /> {user.email}</span>
                                {user.phoneNumber && <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-success" /> {user.phoneNumber}</span>}
                                <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-indigo-500" /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="text-center p-4 bg-background/50 rounded-3xl border border-border/50 min-w-[120px]">
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Efficiency</p>
                            <p className="text-2xl font-black text-primary italic">{stats.taskEfficiency}%</p>
                        </div>
                        <div className="text-center p-4 bg-background/50 rounded-3xl border border-border/50 min-w-[120px]">
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Active Link</p>
                            <div className="flex items-center justify-center gap-2 text-emerald-500">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-black uppercase">Online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-surface/40 backdrop-blur-md border border-border/50 rounded-[2rem] shadow-lg hover:shadow-primary/5 transition-all">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Target className="h-3 w-3 text-primary" /> Mission Target
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black italic tracking-tighter">{stats.totalTasks}</span>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tasks Assigned</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-surface/40 backdrop-blur-md border border-border/50 rounded-[2rem] shadow-lg hover:shadow-primary/5 transition-all">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-success" /> Executed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black italic tracking-tighter">{stats.completedTasks}</span>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tasks Finished</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-surface/40 backdrop-blur-md border border-border/50 rounded-[2rem] shadow-lg hover:shadow-primary/5 transition-all">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Briefcase className="h-3 w-3 text-indigo-500" /> Deployment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black italic tracking-tighter">{stats.projectTally.total}</span>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Projects</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-surface/40 backdrop-blur-md border border-border/50 rounded-[2rem] shadow-lg hover:shadow-primary/5 transition-all">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-3 w-3 text-orange-500" /> Active Pulse
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black italic tracking-tighter">{stats.involvedProjectsCount}</span>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cross-Project Tasking</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Visual Analytics */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    <Card className="bg-surface/30 border border-border/50 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Task Status Distribution</CardTitle>
                                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Functional spread of assigned operative tasks.</CardDescription>
                                </div>
                                <PieChartIcon className="h-6 w-6 text-primary opacity-50" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                {Object.entries(stats.taskStatusDistribution).map(([status, count]: [string, any]) => {
                                    const percentage = Math.round((count / stats.totalTasks) * 100);
                                    let color = "bg-primary";
                                    if (status === 'DONE') color = "bg-success";
                                    if (status === 'IN_PROGRESS') color = "bg-indigo-500";
                                    if (status === 'HALTED') color = "bg-red-500";
                                    if (status === 'REVIEW') color = "bg-orange-500";

                                    return (
                                        <div key={status} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    <div className={cn("h-1.5 w-1.5 rounded-full", color.replace('bg-', 'text-'))} />
                                                    {status.replace('_', ' ')}
                                                </span>
                                                <span className="text-sm font-black italic">{count} <span className="text-[10px] text-muted-foreground not-italic opacity-50">({percentage}%)</span></span>
                                            </div>
                                            <div className="h-3 w-full bg-muted/20 rounded-full overflow-hidden border border-border/10 p-0.5">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]", color)}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Assigned Projects */}
                        <Card className="bg-surface/30 border border-border/50 rounded-[2.5rem]">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-lg font-black uppercase italic tracking-tighter flex items-center justify-between">
                                    Strategic Deployment
                                    <Briefcase className="h-5 w-5 text-indigo-500" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                <div className="space-y-4">
                                    {projects.length > 0 ? projects.map((project: any) => (
                                        <div key={project.id} className="p-4 bg-background/40 border border-border/50 rounded-2xl hover:border-primary/30 transition-all group">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">{project.name}</p>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                        {project.status} <ChevronRight className="h-2 w-2" /> {project.currentStage?.name || 'INITIALIZING'}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="text-[8px] h-5 border-border/50">
                                                    {project.ownerId === user.id ? 'OWNER' : 'STAKEHOLDER'}
                                                </Badge>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 opacity-30 italic text-xs">No active deployments linked.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Tasks */}
                        <Card className="bg-surface/30 border border-border/50 rounded-[2.5rem]">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-lg font-black uppercase italic tracking-tighter flex items-center justify-between">
                                    Current Directive
                                    <Target className="h-5 w-5 text-primary" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0">
                                <div className="space-y-4">
                                    {assignedTasks.length > 0 ? assignedTasks.map((task: any) => (
                                        <div key={task.id} className="p-4 bg-background/40 border border-border/50 rounded-2xl">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-bold text-sm tracking-tight line-clamp-1">{task.title}</p>
                                                    <Badge className={cn(
                                                        "text-[8px] font-black h-4",
                                                        task.status === 'DONE' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                                                    )}>{task.status}</Badge>
                                                </div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                                    <Briefcase className="h-2.5 w-2.5" /> {task.story.project.name}
                                                </p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8 opacity-30 italic text-xs">No active task load.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Lateral: Activity Feed */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <Card className="bg-surface/30 border border-border/50 rounded-[2.5rem] h-full flex flex-col overflow-hidden">
                        <CardHeader className="p-8 border-b border-border/50">
                            <CardTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                                <ActivityIcon className="h-5 w-5 text-emerald-500" />
                                Operative Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            <ScrollArea className="h-[600px] p-8">
                                <div className="space-y-8 relative">
                                    {/* Timeline line */}
                                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border/30 rounded-full" />

                                    {recentActivity.length > 0 ? recentActivity.map((activity: any) => (
                                        <div key={activity.id} className="relative pl-10 group">
                                            {/* dot */}
                                            <div className="absolute left-0 top-1.5 h-6 w-6 rounded-lg bg-surface border border-border/50 shadow-sm flex items-center justify-center group-hover:border-primary/50 transition-colors z-10">
                                                <ActivityIcon className="h-3 w-3 text-muted-foreground" />
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-bold leading-none tracking-tight">
                                                        <span className="text-primary font-black uppercase tracking-widest text-[10px] mr-2">
                                                            {activity.action.split(' ')[0]}
                                                        </span>
                                                        {activity.action.split(' ').slice(1).join(' ')}
                                                    </p>
                                                </div>
                                                {activity.entityName && (
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{activity.entityName}</p>
                                                )}
                                                <div className="flex items-center gap-2 text-[9px] font-medium text-muted-foreground/60 italic">
                                                    <Clock className="h-2.5 w-2.5" />
                                                    {new Date(activity.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-12 opacity-30 italic text-xs">No recent activity detected.</div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
