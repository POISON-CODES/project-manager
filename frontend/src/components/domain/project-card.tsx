"use client";

import Link from "next/link";
import { MoreVertical, AlertCircle, Clock, User as UserIcon, UserCheck, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Project, SystemStatus } from "@/types";
import { projectService } from "@/services/project.service";
import { toast } from "sonner";
import { useState } from "react";

interface ProjectCardProps {
    project: Project;
}

const StatusBadge = ({ status, isHalted }: { status?: string; isHalted?: boolean }) => {
    if (isHalted || status === "HALTED") {
        return (
            <Badge variant="destructive" className="font-black text-[9px] uppercase gap-1.5 animate-pulse border-destructive/50 bg-destructive/10 text-destructive h-5 px-2 rounded-sm shadow-[0_0_8px_rgba(var(--destructive),0.3)]">
                <AlertCircle className="h-2.5 w-2.5" /> Sector Halted
            </Badge>
        );
    }

    const styles: Record<string, string> = {
        PLANNING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        ACTIVE: "bg-primary/10 text-primary border-primary/20",
        ON_HOLD: "bg-muted/50 text-muted-foreground border-border",
        COMPLETED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        ARCHIVED: "bg-muted/30 text-muted-foreground/50 border-border/50",
        // System statuses (for fallback)
        TODO: "bg-muted/50 text-muted-foreground border-border",
        IN_PROGRESS: "bg-primary/10 text-primary border-primary/20",
        DONE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    };

    return (
        <Badge variant="outline" className={cn("font-black text-[9px] uppercase h-5 px-2 rounded-sm tracking-widest", styles[status || "TODO"])}>
            {status?.replace("_", " ")}
        </Badge>
    );
};

export function ProjectCard({ project }: ProjectCardProps) {
    const [isClaiming, setIsClaiming] = useState(false);
    const isHalted = project.status === "HALTED" || project.isHalted;
    const isUnassigned = !project.owner || !project.owner.id;

    const handleClaim = async () => {
        try {
            setIsClaiming(true);
            await projectService.claimProject(project.id);
            toast.success("Initiative claimed successfully");
            // Refresh would be better, but for now we just show success
            window.location.reload();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to claim initiative");
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <Card
            className={cn(
                "bg-surface border-border transition-all hover:bg-accent/5 group shadow-sm flex flex-col h-full",
                isHalted && "border-destructive/40 ring-1 ring-destructive/10"
            )}
        >
            <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                        <Link href={`/projects/${project.id}`} className="hover:underline">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors cursor-pointer font-bold tracking-tight">
                                {project.name}
                            </CardTitle>
                        </Link>
                        <StatusBadge status={project.status} isHalted={isHalted} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed">
                        {project.description}
                    </p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-surface border-border p-1 rounded-lg">
                        <DropdownMenuItem className="text-xs font-bold cursor-pointer rounded-md">Edit Project</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs font-bold cursor-pointer rounded-md">Manage Team</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs font-bold cursor-pointer rounded-md text-destructive focus:text-destructive">Archive</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[11px] text-muted-foreground mb-5 uppercase font-mono tracking-tight">
                    <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                        <span className="font-black text-foreground">{project.stage || "Planning"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>Updated {project.updatedAt && new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <UserIcon className="h-3 w-3" />
                        <span className={cn("font-bold", isUnassigned ? "text-amber-500 italic" : "")}>
                            {project.owner?.name || "UNASSIGNED"}
                        </span>
                    </div>
                </div>

                {/* Task Priority Visualization */}
                {project.taskStats && (() => {
                    const stats = project.taskStats;
                    const totalSteps = stats.total || 1;
                    const complexity = Math.round(((stats.total - stats.low) / totalSteps) * 100);

                    return (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-muted-foreground/70">
                                <span>Resource Load: <span className="text-foreground">{stats.total} ISSUES</span></span>
                                <span>{complexity}% COMPLEXITY</span>
                            </div>
                            <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-muted/50 border border-border/50">
                                <div style={{ width: `${(stats.low / totalSteps) * 100}%` }} className="bg-blue-500/80 h-full transition-all" title={`Low: ${stats.low}`} />
                                <div style={{ width: `${(stats.medium / totalSteps) * 100}%` }} className="bg-green-500/80 h-full transition-all" title={`Medium: ${stats.medium}`} />
                                <div style={{ width: `${(stats.high / totalSteps) * 100}%` }} className="bg-orange-500/80 h-full transition-all" title={`High: ${stats.high}`} />
                                <div style={{ width: `${(stats.critical / totalSteps) * 100}%` }} className="bg-red-500/80 h-full transition-all" title={`Critical: ${stats.critical}`} />
                            </div>
                        </div>
                    );
                })()}
            </CardContent>
            {isUnassigned && (
                <CardFooter className="pt-0 pb-6 px-6">
                    <Button
                        onClick={handleClaim}
                        disabled={isClaiming}
                        className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-black uppercase tracking-widest text-[10px] h-10 rounded-xl transition-all group/claim"
                    >
                        {isClaiming ? (
                            <span className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 animate-spin" /> SECURING SIGNAL...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <UserCheck className="h-3.5 w-3.5 group-hover/claim:scale-110 transition-transform" /> Claim Initiative
                            </span>
                        )}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
