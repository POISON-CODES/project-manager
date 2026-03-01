"use client";

import * as React from "react";
import {
    Plus,
    GripVertical,
    MoreVertical,
    Edit,
    Trash2,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    Clock
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface ProjectStage {
    id: string;
    name: string;
    color: string;
    description: string;
    isSystem: boolean;
    order: number;
}

const INITIAL_STAGES: ProjectStage[] = [
    { id: "s-1", name: "Intake", color: "bg-blue-500", description: "Initial project request and triage phase.", isSystem: true, order: 0 },
    { id: "s-2", name: "Planning", color: "bg-amber-500", description: "Scope definition and resource allocation.", isSystem: false, order: 1 },
    { id: "s-3", name: "Development", color: "bg-indigo-500", description: "Active engineering and sprint execution.", isSystem: false, order: 2 },
    { id: "s-4", name: "Testing", color: "bg-purple-500", description: "Quality assurance and stakeholder review.", isSystem: false, order: 3 },
    { id: "s-5", name: "Maintenance", color: "bg-emerald-500", description: "Post-launch support and monitoring.", isSystem: false, order: 4 },
];

export default function ProjectStagesPage() {
    const [stages, setStages] = React.useState<ProjectStage[]>(INITIAL_STAGES);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Project Lifecycle</h1>
                    <p className="text-muted-foreground">Define and order the global stages for all project workflows.</p>
                </div>
                <Button className="font-bold gap-2">
                    <Plus className="h-4 w-4" /> Create Stage
                </Button>
            </div>

            <Card className="bg-surface border-border border-l-4 border-l-primary">
                <CardContent className="pt-6 flex gap-4">
                    <div className="p-2 rounded-full bg-primary/10 text-primary h-fit">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold">System Governance</p>
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                            Stages marked with <ShieldCheck className="h-3 w-3 inline text-primary mx-0.5" /> are system-critical.
                            These define the core state transitions for automation triggers.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-3">
                {stages.map((stage, index) => (
                    <div
                        key={stage.id}
                        className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all animate-in slide-in-from-left-2 duration-300"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="cursor-grab text-muted-foreground/30 hover:text-primary transition-colors">
                            <GripVertical className="h-5 w-5" />
                        </div>

                        <div className={cn("h-4 w-4 rounded-full", stage.color)} />

                        <div className="flex-1 space-y-0.5">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm tracking-tight">{stage.name}</span>
                                {stage.isSystem && (
                                    <Badge variant="secondary" className="h-4 px-1 bg-primary/20 text-primary border-primary/30 text-[8px] uppercase font-black">System</Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground italic line-clamp-1">{stage.description}</p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right hidden md:block">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Active Projects</p>
                                <p className="text-sm font-mono">{Math.floor(Math.random() * 10)}</p>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-surface/70 backdrop-blur-md border border-border shadow-2xl">
                                    <DropdownMenuItem className="cursor-pointer gap-2">
                                        <Edit className="h-4 w-4" /> Edit Stage
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer gap-2 text-destructive" disabled={stage.isSystem}>
                                        <Trash2 className="h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-xl">
                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Plus className="h-4 w-4" /> Add custom stage between segments
                </Button>
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}
