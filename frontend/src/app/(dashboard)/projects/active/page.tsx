"use client";

import * as React from "react";
import { Plus, Search, Filter, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { projectService } from "@/services/project.service";
import { Project } from "@/types";
import { ProjectCard } from "@/components/domain/project-card";

/**
 * Active Projects Page.
 * Fetches and displays projects that are currently IN_PROGRESS or ACTIVE.
 */
export default function ActiveProjectsPage() {
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");

    React.useEffect(() => {
        const fetchActiveProjects = async () => {
            try {
                const allProjects = await projectService.getProjects();
                const active = allProjects.filter(p =>
                    p.status === 'ACTIVE' ||
                    p.status === 'IN_PROGRESS' ||
                    p.status === 'HALTED'
                );
                setProjects(active);
            } catch (err) {
                console.error("Failed to fetch active projects:", err);
            } finally {
                setTimeout(() => setIsLoading(false), 300);
            }
        };

        fetchActiveProjects();
    }, []);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-3">
                        <Activity className="h-8 w-8 text-primary" />
                        Active Initiatives
                    </h1>
                    <p className="text-muted-foreground leading-relaxed">Currently running projects and mission-critical tracks.</p>
                </div>
                <Button className="font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 uppercase tracking-widest text-xs">
                    <Plus className="h-4 w-4" /> New Initiative
                </Button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                    <Input
                        placeholder="Search active tracks..."
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-44 rounded-2xl bg-surface/50 border border-border/50" />
                    ))}
                </div>
            ) : filteredProjects.length === 0 ? (
                <Card className="bg-surface/30 border-border border-dashed py-32 rounded-3xl">
                    <div className="flex flex-col items-center justify-center text-center px-6">
                        <div className="p-5 bg-muted/20 rounded-full mb-6 border border-border/50">
                            <Activity className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight">No Active Projects</h3>
                        <p className="text-muted-foreground max-w-sm mt-2 text-sm">
                            There are currently no initiatives in the active stage.
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}
        </div>
    );
}
