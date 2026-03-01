"use client";

import * as React from "react";
import {
    Plus,
    Zap,
    MoreVertical,
    Play,
    Pause,
    Settings2,
    Trash2,
    Webhook,
    Search,
    Filter,
    Loader2
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Workflow } from "@/types";
import { WorkflowEditor } from "./components/workflow-editor";
import { workflowService } from "@/services/workflow.service";
import { toast } from "sonner";
import { FeatureGuard } from "@/components/shared/feature-guard";

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = React.useState<Workflow[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isEditorOpen, setIsEditorOpen] = React.useState(false);
    const [selectedWorkflow, setSelectedWorkflow] = React.useState<Workflow | undefined>(undefined);
    const [searchQuery, setSearchQuery] = React.useState("");

    const fetchWorkflows = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await workflowService.getWorkflows();
            setWorkflows(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load workflows");
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchWorkflows();
    }, [fetchWorkflows]);

    const handleCreate = () => {
        setSelectedWorkflow(undefined);
        setIsEditorOpen(true);
    };

    const handleEdit = (wf: Workflow) => {
        setSelectedWorkflow(wf);
        setIsEditorOpen(true);
    };

    const handleSave = async (data: Partial<Workflow>) => {
        try {
            if (selectedWorkflow) {
                // Update existing - Note: Backend needs an update for patch
                toast.info("Update is not yet implemented on the backend");
            } else {
                // Create new
                await workflowService.createWorkflow(data);
                toast.success("Workflow created successfully");
                fetchWorkflows();
            }
            setIsEditorOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save workflow");
        }
    };

    const toggleActive = (id: string) => {
        // Optimistic update
        setWorkflows(workflows.map(w => w.id === id ? { ...w, isActive: !w.isActive } : w));
        toast.info("Status toggled locally. Syncing not yet implemented on backend.");
    };

    const deleteWorkflow = (id: string) => {
        setWorkflows(workflows.filter(w => w.id !== id));
        toast.info("Delete not yet implemented on backend");
    };

    const filteredWorkflows = workflows.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <FeatureGuard feature="AUTOMATION">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                    <WorkflowEditor workflow={selectedWorkflow} onSave={handleSave} />
                </Dialog>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight uppercase italic flex items-center gap-2">
                            < Zap className="h-8 w-8 text-primary" />
                            Workflows
                        </h1>
                        <p className="text-muted-foreground italic">Automate your project management processes with custom triggers and actions.</p>
                    </div>
                    <Button className="font-black gap-2 h-11 px-8 shadow-lg shadow-primary/20 uppercase text-xs tracking-widest" onClick={handleCreate}>
                        <Plus className="h-4 w-4" /> Create Workflow
                    </Button>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50" />
                        <Input
                            placeholder="Search automation models..."
                            className="pl-9 bg-surface/50 border-border/50 h-11 italic"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="gap-2 border-border/50 h-11 font-bold uppercase text-[10px] tracking-widest px-4">
                        <Filter className="h-4 w-4" /> Filter
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex h-[400px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredWorkflows.length === 0 ? (
                    <div className="border-2 border-dashed border-border rounded-3xl py-24 text-center">
                        <Zap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-xl font-bold italic">No Workflows Found</h3>
                        <p className="text-muted-foreground">Start by creating your first automation rule.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredWorkflows.map((workflow) => (
                            <Card key={workflow.id} className={cn(
                                "bg-card border-border/50 transition-all hover:bg-accent/5 overflow-hidden flex flex-col shadow-xl shadow-primary/5",
                                !workflow.isActive && "opacity-75 grayscale-[0.5]"
                            )}>
                                <CardHeader className="pb-3 border-b border-border/30 bg-accent/5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/20">
                                            <Zap className="h-5 w-5 fill-primary" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={workflow.isActive}
                                                onCheckedChange={() => toggleActive(workflow.id)}
                                            />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-surface/70 backdrop-blur-md border border-border shadow-2xl">
                                                    <DropdownMenuItem className="cursor-pointer gap-2 font-bold uppercase text-[10px] tracking-widest" onClick={() => handleEdit(workflow)}>
                                                        <Settings2 className="h-3.5 w-3.5" /> Edit Template
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="cursor-pointer gap-2 font-bold uppercase text-[10px] tracking-widest text-primary">
                                                        <Play className="h-3.5 w-3.5" /> Force Execute
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="cursor-pointer gap-2 font-bold uppercase text-[10px] tracking-widest text-destructive" onClick={() => deleteWorkflow(workflow.id)}>
                                                        <Trash2 className="h-3.5 w-3.5" /> Archive
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <CardTitle className="text-xl font-black italic tracking-tight">{workflow.name}</CardTitle>
                                        <CardDescription className="line-clamp-2 mt-2 min-h-[2.5rem] italic leading-relaxed">
                                            {workflow.description}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="py-6 flex-1 space-y-6">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">System Trigger</p>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 font-black text-[10px] uppercase tracking-tighter px-2">
                                                {workflow.triggerType}
                                            </Badge>
                                            <span className="text-[10px] font-bold italic text-muted-foreground">
                                                {Object.keys(workflow.triggerConfig).length > 0 ? (
                                                    `Filtered: ${Object.entries(workflow.triggerConfig).map(([k, v]) => `${k}=${v}`).join(", ")}`
                                                ) : (
                                                    "Unfiltered Events"
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Automated Pipeline</p>
                                        <div className="space-y-2">
                                            {workflow.actions.map((action, i) => (
                                                <div key={action.id} className="flex items-center gap-3 text-xs p-3 rounded-xl bg-muted/40 border border-border/50 group/action">
                                                    <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center border border-border text-primary group-hover/action:scale-110 transition-transform">
                                                        <Webhook className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-[10px] uppercase tracking-widest text-foreground/70">{action.type}</p>
                                                        <p className="font-mono text-[9px] truncate text-muted-foreground">{action.config.url}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-4 border-t border-border/30 px-6 py-4 flex items-center justify-between text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                                    <span>Refreshed: {new Date(workflow.updatedAt).toLocaleDateString()}</span>
                                    <div className="flex items-center gap-1">
                                        {workflow.isActive ? (
                                            <span className="flex items-center gap-1.5 text-success">
                                                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> Online
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Offline
                                            </span>
                                        )}
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}

                        {/* New Workflow Card */}
                        <button
                            className="h-full min-h-[300px] border-2 border-dashed border-border/50 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all group shadow-xl shadow-transparent hover:shadow-primary/5"
                            onClick={handleCreate}
                        >
                            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all border border-border/50 group-hover:rotate-12">
                                <Plus className="h-8 w-8 transition-transform group-hover:scale-125" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="font-black italic text-lg uppercase tracking-tight">Init Automation</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-8">Define custom triggers and actions</p>
                            </div>
                        </button>
                    </div>
                )}
            </div>
        </FeatureGuard>
    );
}
