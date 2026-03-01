"use client";

import { useEffect, useState } from "react";
import { projectService } from "@/services/project.service";
import { Project } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Clock,
    User,
    FileText,
    ArrowRight,
    Search,
    LayoutGrid,
    List,
    AlertCircle,
    CheckCircle2,
    Calendar,
    Briefcase,
    Shield
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";

export default function ProjectQueuePage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const data = await projectService.getQueue();
                setProjects(data);
            } catch (error) {
                console.error("Failed to fetch project queue:", error);
                toast.error("Failed to synchronize with mission triage center.");
            } finally {
                setLoading(false);
            }
        };

        fetchQueue();
    }, []);

    const handleClaim = async (projectId: string) => {
        try {
            await projectService.claimProject(projectId);
            setProjects(prev => prev.filter(p => p.id !== projectId));
            toast.success("Mission Claimed: You have been assigned as the commanding officer.");
        } catch (error) {
            console.error("Failed to claim project:", error);
            toast.error("Unable to secure mission ownership.");
        }
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto min-h-screen bg-transparent">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/10">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/80">Mission Triage</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent italic">
                        PROJECT_QUEUE.exe
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium max-w-md leading-relaxed">
                        Unclaimed operational initiatives awaiting authorization and mission leadership assignment.
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-secondary/30 p-2 rounded-2xl border border-border/5 backdrop-blur-sm">
                    <div className="relative group w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <input
                            type="text"
                            placeholder="Filter queue..."
                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold pl-10 pr-4 placeholder:text-muted-foreground/50 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="p-6 bg-secondary/20 border-border/5 rounded-3xl">
                            <div className="flex items-start justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <Skeleton className="h-8 w-1/3 rounded-lg" />
                                    <Skeleton className="h-4 w-full rounded-md" />
                                    <div className="flex gap-4">
                                        <Skeleton className="h-6 w-24 rounded-full" />
                                        <Skeleton className="h-6 w-24 rounded-full" />
                                    </div>
                                </div>
                                <Skeleton className="h-12 w-32 rounded-xl" />
                            </div>
                        </Card>
                    ))
                ) : filteredProjects.length > 0 ? (
                    <div className="space-y-4">
                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                            >
                                <Card className="group relative overflow-hidden p-6 bg-secondary/20 hover:bg-secondary/30 border-border/5 hover:border-primary/20 transition-all duration-500 rounded-3xl backdrop-blur-md">
                                    {/* Glow Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black tracking-widest uppercase py-0.5 rounded-md">
                                                    <Shield className="h-3 w-3 mr-1.5" />
                                                    Unclaimed
                                                </Badge>
                                                <div className="h-1 w-1 rounded-full bg-border" />
                                                <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(project.createdAt), "dd MMM yyyy")}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors">
                                                    {project.name}
                                                </h3>
                                                <p className="text-muted-foreground text-sm font-medium line-clamp-2 leading-relaxed max-w-2xl">
                                                    {project.description || "No tactical description provided for this mission."}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-6 pt-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                                        <Briefcase className="h-4 w-4" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Stakeholder</p>
                                                        <p className="text-[11px] font-bold">{project.stakeholder?.name || "Anonymous Requester"}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                        <Clock className="h-4 w-4" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Deadline</p>
                                                        <p className="text-[11px] font-bold">
                                                            {project.endDate ? format(new Date(project.endDate), "PPP") : "TBD"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {project.currentStage && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                            <LayoutGrid className="h-4 w-4" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Current Stage</p>
                                                            <p className="text-[11px] font-bold">{project.currentStage.name}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-3">
                                            <Button
                                                variant="secondary"
                                                className="w-full sm:w-auto px-6 py-6 rounded-2xl font-black text-[13px] tracking-widest uppercase border border-border/5 hover:bg-secondary/80 transition-all active:scale-95"
                                                asChild
                                            >
                                                <Link href={`/projects/${project.id}`}>
                                                    View Details
                                                </Link>
                                            </Button>
                                            <Button
                                                className="w-full sm:w-auto px-8 py-6 rounded-2xl font-black text-[13px] tracking-widest uppercase shadow-lg shadow-primary/20 transition-all active:scale-95 group-hover:scale-[1.02]"
                                                onClick={() => handleClaim(project.id)}
                                            >
                                                Claim Mission
                                                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                        <div className="h-24 w-24 rounded-full bg-secondary/20 flex items-center justify-center animate-pulse">
                            <CheckCircle2 className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black tracking-tight text-muted-foreground">Queue Optimized</h3>
                            <p className="text-sm text-muted-foreground/60 font-medium">All missions have been successfully assigned to commanding officers.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
