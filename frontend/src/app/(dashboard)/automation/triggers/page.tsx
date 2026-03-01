"use client";

import * as React from "react";
import {
    Zap,
    Activity,
    Link2,
    Search,
    Filter,
    Play,
    History,
    MoreHorizontal,
    Webhook,
    Database,
    Bell,
    Settings2,
    ChevronRight,
    ArrowUpRight
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FeatureGuard } from "@/components/shared/feature-guard";

const MOCK_TRIGGERS = [
    {
        id: "TRG-001",
        name: "Task Completed",
        type: "SYSTEM",
        description: "Fires whenever any task is marked as completed in any project.",
        workflows: 3,
        status: "ACTIVE",
        lastFired: "12 mins ago"
    },
    {
        id: "TRG-002",
        name: "Incoming Webhook",
        type: "WEBHOOK",
        description: "Public endpoint for external services to trigger NexuxFlow events.",
        workflows: 1,
        status: "ACTIVE",
        lastFired: "2 hours ago"
    },
    {
        id: "TRG-003",
        name: "Project Created",
        type: "SYSTEM",
        description: "Fires when a new project is initialized via intake forms.",
        workflows: 2,
        status: "INACTIVE",
        lastFired: "Yesterday"
    },
    {
        id: "TRG-004",
        name: "Stage Changed",
        type: "SYSTEM",
        description: "Fires when a project moves from one lifecycle stage to another.",
        workflows: 5,
        status: "ACTIVE",
        lastFired: "Just now"
    },
    {
        id: "TRG-005",
        name: "Form Submitted",
        type: "SYSTEM",
        description: "Fires when an intake form is submitted but not yet reviewed.",
        workflows: 1,
        status: "ACTIVE",
        lastFired: "5 mins ago"
    }
];

export default function TriggersPage() {
    return (
        <FeatureGuard feature="AUTOMATION">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent italic flex items-center gap-3">
                            <Zap className="h-8 w-8 text-primary fill-primary/20" />
                            Automation Triggers
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage system events and webhooks that power your automation engine.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2 border-border/50 bg-surface/50 backdrop-blur-sm">
                            <History className="h-4 w-4" /> View Execution Log
                        </Button>
                        <Button className="font-bold gap-2 shadow-lg shadow-primary/20">
                            <Webhook className="h-4 w-4" /> Create Webhook
                        </Button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-surface/40 backdrop-blur-xl border-border/30 overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity className="h-12 w-12 text-primary" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Active Subscriptions</CardTitle>
                            <div className="text-3xl font-black">12</div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[10px] text-muted-foreground">Workflows currently listening to system events.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-surface/40 backdrop-blur-xl border-border/30 overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap className="h-12 w-12 text-primary" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Total Executions</CardTitle>
                            <div className="text-3xl font-black text-primary">1,248</div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[10px] text-muted-foreground">Trigger fires in the last 30 days.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-surface/40 backdrop-blur-xl border-border/30 overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Link2 className="h-12 w-12 text-primary" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Webhook Success Rate</CardTitle>
                            <div className="text-3xl font-black text-success">99.8%</div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[10px] text-muted-foreground">Reliability score for external integrations.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* List Header */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-b border-border/50 pb-4">
                    <div className="flex gap-4 items-center flex-1 w-full md:w-auto">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search triggers..." className="pl-10 h-9 bg-surface/50 border-border/50" />
                        </div>
                        <Button variant="ghost" size="sm" className="h-9 gap-2">
                            <Filter className="h-4 w-4" /> Filter
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border/50">
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider bg-background shadow-sm px-4">All</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-4">System</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-4">Webhooks</Button>
                    </div>
                </div>

                {/* Triggers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_TRIGGERS.map((trigger) => (
                        <Card key={trigger.id} className="group hover:border-primary/50 transition-all duration-300 bg-surface/30 backdrop-blur-md border-border/50 relative overflow-hidden">
                            <div className={cn(
                                "absolute top-0 left-0 w-1 h-full transition-transform origin-top duration-500 scale-y-0 group-hover:scale-y-100",
                                trigger.status === "ACTIVE" ? "bg-primary" : "bg-muted"
                            )} />

                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="text-[10px] font-bold border-primary/20 bg-primary/5 text-primary">
                                        {trigger.type}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground font-mono uppercase">{trigger.id}</span>
                                </div>
                                <CardTitle className="text-xl group-hover:text-primary transition-colors flex items-center justify-between">
                                    {trigger.name}
                                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </CardTitle>
                                <CardDescription className="text-xs line-clamp-2 min-h-[32px]">
                                    {trigger.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-2 rounded-lg bg-accent/5 border border-border/30">
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Workflow Sinks</p>
                                        <p className="text-sm font-bold flex items-center gap-1.5">
                                            <Database className="h-3 w-3 text-primary" />
                                            {trigger.workflows} Configured
                                        </p>
                                    </div>
                                    <div className="text-right space-y-0.5">
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Last Pulsed</p>
                                        <p className="text-[10px] font-medium text-foreground">{trigger.lastFired}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <Button variant="outline" className="flex-1 h-8 text-[10px] font-bold uppercase gap-2 hover:bg-primary/10 hover:text-primary transition-colors">
                                        <Play className="h-3 w-3" /> Test Trigger
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                        <Settings2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Create Card placeholder */}
                    <button className="h-full min-h-[250px] flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                        <div className="h-12 w-12 rounded-full border border-border/50 flex items-center justify-center group-hover:scale-110 transition-transform bg-surface">
                            <Zap className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold">Register New Trigger</p>
                            <p className="text-xs text-muted-foreground px-6 mt-1">Add a system event or webhook endpoint to NexuxFlow.</p>
                        </div>
                    </button>
                </div>
            </div>
        </FeatureGuard>
    );
}
