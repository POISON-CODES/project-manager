"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    User as UserIcon,
    Users,
    Layers,
    AlertCircle,
    Plus,
    ExternalLink,
    FileText,
    Activity,
    Database,
    ShieldCheck,
    MessageSquare,
    ChevronRight,
    Loader2
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, getInitials } from "@/lib/utils";
import { Project, UserStory, Task, Priority, User } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { UserStoryCard } from "@/components/domain/user-story-card";
import { projectService } from "@/services/project.service";
import { stageService } from "@/services/stage.service";
import { toast } from "sonner";

export default function SubmissionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { id: formId, projectId } = params as { id: string; projectId: string };

    const [project, setProject] = React.useState<Project | null>(null);
    const [stages, setStages] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isUpdating, setIsUpdating] = React.useState(false);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [projectData, stagesData] = await Promise.all([
                    projectService.getProjectById(projectId),
                    stageService.getStages()
                ]);
                setProject(projectData);
                setStages(stagesData);
            } catch (err: any) {
                console.error("Failed to fetch submission details:", err);
                toast.error("Failed to load submission data");
            } finally {
                setIsLoading(false);
            }
        };

        if (projectId) fetchData();
    }, [projectId]);

    const handleUpdateStage = async (stageId: string) => {
        if (!project) return;
        setIsUpdating(true);
        try {
            await projectService.updateProjectStage(project.id, stageId);
            setProject({ ...project, currentStageId: stageId });
            toast.success("Project stage updated successfully");
        } catch (error) {
            toast.error("Failed to update stage");
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background/50 backdrop-blur-md">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Retriving Submission Dossier...</p>
                </div>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="flex flex-col h-full bg-background border border-border/50 rounded-3xl animate-in fade-in duration-700 overflow-hidden shadow-2xl shadow-primary/5">
            {/* Header / Dossier Overview */}
            <div className="flex-none p-6 border-b border-border/50 bg-surface/30 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="p-2 rounded-xl bg-muted/10 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer border border-border/50 shadow-sm"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                                    Submission: {project.name}
                                </h1>
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black tracking-widest px-3 h-5">INTAKE v{project.formTemplate?.version || 1}</Badge>
                            </div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <FileText className="h-3 w-3" /> Origin Protocol: <span className="text-foreground">{project.formTemplate?.title || "Standard Intake"}</span>
                                <ChevronRight className="h-2 w-2" />
                                <span className="text-primary italic">Received {new Date(project.createdAt).toLocaleString()}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="font-black text-[10px] uppercase tracking-widest gap-2 bg-background/50 border-border shadow-sm">
                            <MessageSquare className="h-3.5 w-3.5" /> Comments
                        </Button>
                        <Button size="sm" onClick={() => router.push(`/projects/${project.id}`)} className="font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/20">
                            <ExternalLink className="h-3.5 w-3.5" /> Open in Workspace
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Areas */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                {/* Left Side: Submission Data (4 cols) */}
                <div className="lg:col-span-4 border-r border-border/50 bg-muted/5 flex flex-col h-full overflow-hidden">
                    <Tabs defaultValue="form-data" className="flex flex-col h-full">
                        <div className="px-6 pt-4 flex-none">
                            <TabsList className="w-full bg-background/50 border border-border/50 p-1 rounded-xl h-10">
                                <TabsTrigger value="form-data" className="flex-1 text-[9px] font-black uppercase tracking-widest gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                                    <Database className="h-3 w-3" /> Form Data
                                </TabsTrigger>
                                <TabsTrigger value="metadata" className="flex-1 text-[9px] font-black uppercase tracking-widest gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                                    <ShieldCheck className="h-3 w-3" /> System Specs
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <TabsContent value="form-data" className="mt-0 space-y-6">
                                <div className="space-y-6">
                                    {Object.entries(project.formData || {}).map(([key, value]) => (
                                        <div key={key} className="space-y-1.5 group p-4 rounded-2xl bg-surface/50 border border-border/30 hover:border-primary/20 transition-all">
                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                            <p className="text-sm font-medium italic">{String(value)}</p>
                                        </div>
                                    ))}

                                    {(!project.formData || Object.keys(project.formData).length === 0) && (
                                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                                            <Database className="h-10 w-10 mb-2" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No Structured Data</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="metadata" className="mt-0 space-y-6">
                                <div className="space-y-4">
                                    <Card className="bg-surface/50 border-border/50 shadow-none rounded-2xl p-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                            <Activity className="h-3 w-3" /> Project Lifecycle
                                        </h4>
                                        <div className="space-y-4">
                                            {stages.map(stage => (
                                                <div
                                                    key={stage.id}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer scale-100 active:scale-95",
                                                        project.currentStageId === stage.id
                                                            ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5"
                                                            : "bg-background/40 border-border/50 hover:border-primary/30"
                                                    )}
                                                    onClick={() => handleUpdateStage(stage.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_8px]", project.currentStageId === stage.id ? "bg-primary shadow-primary" : "bg-muted-foreground/30")} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{stage.name}</span>
                                                    </div>
                                                    {project.currentStageId === stage.id && <CheckCircle2 className="h-3 w-3" />}
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                </div>

                {/* Right Side: Operational Workspace (8 cols) */}
                <div className="lg:col-span-8 flex flex-col h-full bg-background overflow-hidden">
                    <div className="p-6 pb-0 flex items-center justify-between flex-none">
                        <div className="space-y-1">
                            <h2 className="text-lg font-black tracking-tight uppercase italic flex items-center gap-3">
                                <span className="h-5 w-1 bg-primary rounded-full" />
                                Project Governance
                            </h2>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Execute and refine project initiatives from this terminal.</p>
                        </div>
                        <Button size="sm" className="font-black text-[9px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/20">
                            <Plus className="h-3.5 w-3.5" /> Initialize User Story
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="bg-surface/30 border-border/50 p-4 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Users className="h-10 w-10 text-primary" />
                                </div>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Principal Owner</p>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 border border-primary/20 shadow-sm">
                                        <AvatarImage src={project.owner?.avatarUrl} />
                                        <AvatarFallback className="text-[10px] font-black">{getInitials(project.owner?.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-0.5">
                                        <p className="text-[11px] font-black leading-tight">{project.owner?.name || "TBD"}</p>
                                        <p className="text-[9px] text-muted-foreground font-medium italic">{project.owner?.email || "No assignee"}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-surface/30 border-border/50 p-4 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <ShieldCheck className="h-10 w-10 text-emerald-500" />
                                </div>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Stakeholder</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm text-emerald-500 font-black text-[10px]">
                                        {getInitials(project.stakeholder?.name) || "N/A"}
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[11px] font-black leading-tight">{project.stakeholder?.name || "Public Submission"}</p>
                                        <p className="text-[9px] text-muted-foreground font-medium italic">Confirmed Participant</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-surface/30 border-border/50 p-4 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Activity className="h-10 w-10 text-orange-500" />
                                </div>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Resource Specs</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Tasks</span>
                                        <span className="text-xl font-black tracking-tighter">{project.taskStats?.total || 0}</span>
                                    </div>
                                    <div className="flex flex-col border-l border-border/50 pl-3">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Risk</span>
                                        <span className="text-[10px] font-black text-orange-500 uppercase">MODERATE</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <Separator className="mb-8 opacity-50" />

                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Layers className="h-4 w-4 text-primary" />
                                <h3 className="text-sm font-black uppercase tracking-widest italic">Story Architecture</h3>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-border to-transparent" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 pb-12">
                                {project.stories && project.stories.length > 0 ? (
                                    project.stories.map((story) => (
                                        <UserStoryCard key={story.id} story={story} />
                                    ))
                                ) : (
                                    <div className="py-20 text-center border-2 border-dashed border-border/20 rounded-3xl opacity-30 flex flex-col items-center justify-center">
                                        <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                                            <Layers className="h-6 w-6" />
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">The backlog is currently empty.</p>
                                        <Button variant="ghost" size="sm" className="mt-4 text-[9px] font-black uppercase tracking-widest text-primary">Initialize first story</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {isUpdating && (
                <div className="fixed inset-0 bg-background/20 backdrop-blur-[2px] z-50 flex items-center justify-center">
                    <div className="bg-surface/90 border border-border/50 p-4 rounded-2xl shadow-2xl flex items-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Updating Project Status...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
