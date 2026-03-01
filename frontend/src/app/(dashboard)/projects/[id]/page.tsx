"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Circle,
    Clock,
    MoreVertical,
    User as UserIcon,
    Users,
    Layers,
    ChevronDown,
    ChevronRight,
    AlertCircle,
    Plus,
    ExternalLink,
    Briefcase
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn, getInitials } from "@/lib/utils";
import { Project, UserStory, Task, SystemStatus, Priority, User, UserRole } from "@/types";
import { ProjectCard } from "@/components/domain/project-card";
import { UserStoryCard } from "@/components/domain/user-story-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { projectService } from "@/services/project.service";
import { toast } from "sonner";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { SpecViewer } from "@/components/domain/spec-viewer";
import { FileText, Layers as LayersIcon } from "lucide-react";


import { useBreadcrumbStore } from "@/store/breadcrumb-store";

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id: projectId } = useParams() as { id: string };
    const { setLabel } = useBreadcrumbStore();

    const [project, setProject] = React.useState<Project | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const handleClaimProject = async () => {
        try {
            const updated = await projectService.claimProject(projectId);
            setProject(updated);
            toast.success("Mission Claimed Successfully");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || "Failed to claim project");
        }
    };

    React.useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                setIsLoading(true);
                const data = await projectService.getProjectById(projectId);
                setProject(data);

                // Set project name as breadcrumb label
                if (data.name) {
                    setLabel(projectId, data.name);
                }
            } catch (err: any) {
                console.error("Failed to fetch project details:", err);
                setError(err.message || "Project not found or access denied.");
                toast.error("Failed to load project details");
            } finally {
                setTimeout(() => setIsLoading(false), 400);
            }
        };

        if (projectId) {
            fetchProjectDetails();
        }
    }, [projectId, setLabel]);

    if (isLoading) {
        return <ProjectDetailsSkeleton />;
    }

    if (error || !project) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in duration-500">
                <div className="p-4 bg-destructive/10 rounded-full">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Project Access Restricted</h2>
                <p className="text-muted-foreground text-sm max-w-xs text-center">{error || "The project you're looking for doesn't exist or you don't have permission to view it."}</p>
                <Button variant="outline" onClick={() => router.push("/projects")} className="font-bold text-xs uppercase tracking-widest gap-2 mt-2">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Workspace
                </Button>
            </div>
        );
    }

    const getDocumentField = () => {
        if (!project || !project.formData || !project.formTemplate) return null;
        const schema = project.formTemplate.schema as any;
        const sections = schema?.sections || [];
        const allFields = sections.flatMap((s: any) => s.fields || []);

        console.log('[DEBUG] formData:', project.formData);
        console.log('[DEBUG] allFields (from sections):', allFields);

        return Object.entries(project.formData).find(([key, val]) =>
            allFields.find((f: any) => (f.id === key || f.name === key) && (f.type === 'document' || f.type === 'file'))
        );
    };

    return (
        <div className="flex flex-col h-full bg-background border border-border/50 rounded-3xl animate-in fade-in duration-700 overflow-hidden shadow-2xl shadow-primary/5">
            <div className="flex-none p-4 pb-0 space-y-3">
                {/* Header / Navigate Back */}
                <div
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary cursor-pointer w-fit transition-all group scale-90 origin-left"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Projects</span>
                </div>

                {/* Title & Actions - More Compact */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                                {project.name}
                            </h1>
                            <StatusBadge status={project.status} isHalted={project.isHalted} className="h-5 px-2 text-[9px] rounded-md" />
                        </div>
                        <p className="text-muted-foreground max-w-2xl text-xs font-medium line-clamp-1 opacity-80">
                            {project.description}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9 px-4 font-black text-[9px] uppercase tracking-widest rounded-lg border-border/50 bg-surface/50">
                            Edit Specs
                        </Button>
                        <Button size="sm" className="h-9 px-4 font-black text-[9px] uppercase tracking-widest rounded-lg shadow-md">
                            <Plus className="h-3.5 w-3.5 mr-1" /> Story
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content Area - Fixed Height with Internal Scroll */}
            <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden">

                {/* Left Column: Sidebar Details (4 cols) - Scrollable if needed */}
                <ScrollArea className="lg:col-span-4 h-full pr-4">
                    <div className="space-y-4 pb-4">
                        {/* Summary Metrics - Removed as requested */}

                        <Card className="bg-surface border-border/50 rounded-2xl shadow-sm overflow-hidden">
                            <CardHeader className="h-9 py-0 px-4 flex flex-row items-center gap-5 border-b border-border/10 bg-muted/5">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2 leading-none">
                                    <Users className="h-3 w-3 text-primary" />
                                    Operational Squad
                                </CardTitle>

                                <div className="flex items-center gap-2 border-l border-border/10 pl-3 h-4">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">Architect</span>
                                    {project.owner ? (
                                        <div className="flex items-center gap-1.5">
                                            <Avatar className="h-5 w-5 border border-primary/20 shadow-sm">
                                                {project.owner.avatarUrl && <AvatarImage src={project.owner.avatarUrl} />}
                                                <AvatarFallback className="text-[7px] font-black bg-primary/5 text-primary">
                                                    {getInitials(project.owner.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <p className="text-[9px] font-bold tracking-tight">{project.owner.name}</p>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handleClaimProject}
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-3 text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all"
                                        >
                                            Claim Mission
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="p-0 flex flex-col min-h-[120px]">
                                {/* Central Section: Mission Team */}
                                <div className="p-4 flex-1">
                                    <div className="space-y-1.5">
                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Mission Team</p>
                                        {project.team && project.team.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {project.team.map(member => (
                                                    <Badge key={member.id} variant="secondary" className="bg-muted/50 hover:bg-muted/80 border-none text-[8px] h-4.5 px-1.5 font-bold transition-colors">
                                                        {member.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[9px] font-bold text-muted-foreground/30 italic leading-none">No field agents assigned</p>
                                        )}
                                    </div>
                                </div>

                                {/* Document Section: Subsurface Data */}
                                {(() => {
                                    const docEntry = getDocumentField();
                                    if (!docEntry) return null;
                                    const [key, url] = docEntry;

                                    return (
                                        <div className="px-4 pb-4">
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-2">Core Specification</p>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <div className="flex items-center gap-3 p-2 bg-muted/5 border border-border/20 rounded-xl cursor-pointer hover:bg-muted/10 transition-colors group">
                                                        <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/20">
                                                            <FileText className="h-4 w-4 text-primary opacity-50 group-hover:opacity-100" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] font-black truncate uppercase tracking-tight">
                                                                {String(url).split('/').pop() || "Project_Spec.pdf"}
                                                            </p>
                                                            <p className="text-[8px] font-bold text-primary tracking-widest opacity-60">ACCESS PROTOCOL</p>
                                                        </div>
                                                        <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary transition-colors mr-2" />
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl h-[80vh] bg-surface border-border/50 rounded-3xl p-0 overflow-hidden">
                                                    <DialogHeader className="p-4 border-b border-border/10 bg-muted/5 flex flex-row items-center justify-between space-y-0">
                                                        <DialogTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Document Infrastructure Explorer</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="w-full h-full bg-muted/10 relative">
                                                        <iframe
                                                            src={String(url)}
                                                            className="w-full h-full border-none"
                                                            title="Specification Viewer"
                                                        />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    );
                                })()}

                                {/* Bottom Anchor: Stakeholder - Identical to Header */}
                                <div className="mt-auto h-9 py-0 px-4 flex flex-row items-center gap-5 bg-muted/5 border-t border-border/10">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2 leading-none">
                                        <Briefcase className="h-3 w-3 text-primary" />
                                        Project Stakeholder
                                    </div>

                                    <div className="flex items-center gap-2 border-l border-border/10 pl-3 h-4">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30">Contact</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-5 w-5 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                                                <UserIcon className="h-2.5 w-2.5 text-primary" />
                                            </div>
                                            <p className="text-[9px] font-bold tracking-tight">{project.stakeholder?.name || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline Mini */}
                        <Card className="bg-surface border-border/50 rounded-2xl shadow-sm p-4 space-y-3">
                            <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Resource Timeline</p>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center justify-between p-2 bg-muted/5 border border-border/50 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3 w-3 text-primary/40" />
                                        <span className="text-[9px] font-bold uppercase text-muted-foreground">Start</span>
                                    </div>
                                    <span className="text-[10px] font-black">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "TBD"}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-muted/5 border border-border/50 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3 text-orange-500/40" />
                                        <span className="text-[9px] font-bold uppercase text-muted-foreground">End</span>
                                    </div>
                                    <span className="text-[10px] font-black">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD"}</span>
                                </div>
                            </div>

                            {/* Risk distribution info simplified */}
                            {project.taskStats && (
                                <div className="pt-2 space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[8px] font-black text-muted-foreground uppercase">Risk Level</span>
                                        <span className="text-[8px] font-black">{project.taskStats.total} total</span>
                                    </div>
                                    <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-muted/30">
                                        <div style={{ width: `${(project.taskStats.low / project.taskStats.total) * 100}%` }} className="bg-blue-500/50 h-full" />
                                        <div style={{ width: `${(project.taskStats.medium / project.taskStats.total) * 100}%` }} className="bg-green-500/50 h-full" />
                                        <div style={{ width: `${(project.taskStats.high / project.taskStats.total) * 100}%` }} className="bg-orange-500/50 h-full" />
                                        <div style={{ width: `${(project.taskStats.critical / project.taskStats.total) * 100}%` }} className="bg-red-500/50 h-full" />
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </ScrollArea>

                {/* Right Column: Execution Content (8 cols) - Main Scrollable Content */}
                <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-4 flex-none px-1">
                            <div className="flex items-center gap-2">
                                <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 h-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                                    <LayersIcon className="h-3 w-3" />
                                    Execution Backlog
                                </div>
                            </div>

                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter border-muted-foreground/20">
                                {project.stories?.length || 0} STORIES
                            </Badge>
                        </div>

                        <div className="flex-1 overflow-hidden mt-0">
                            <ScrollArea className="h-full -mr-4 pr-4">
                                <div className="grid grid-cols-1 gap-4 pb-8">
                                    {project.stories && project.stories.length > 0 ? (
                                        project.stories.map((story) => (
                                            <UserStoryCard key={story.id} story={story} />
                                        ))
                                    ) : (
                                        <div className="py-20 text-center border-2 border-dashed border-border/20 rounded-3xl opacity-50 bg-muted/5">
                                            <Layers className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">No Active Stories Defined</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProjectDetailsSkeleton() {
    return (
        <div className="flex flex-col h-full bg-background border border-border/50 rounded-3xl animate-pulse overflow-hidden shadow-2xl shadow-primary/5">
            <div className="flex-none p-4 pb-0 space-y-3">
                <Skeleton className="h-3 w-32 rounded-full" />
                <div className="flex flex-row items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64 rounded-xl" />
                        <Skeleton className="h-4 w-96 rounded-lg" />
                    </div>
                </div>
            </div>

            <div className="flex-1 p-4 grid grid-cols-12 gap-5">
                <div className="col-span-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-20 rounded-2xl" />
                        <Skeleton className="h-20 rounded-2xl" />
                    </div>
                    <Skeleton className="h-[250px] rounded-2xl" />
                    <Skeleton className="h-[180px] rounded-2xl" />
                </div>
                <div className="col-span-8 space-y-4">
                    <Skeleton className="h-8 w-48 rounded-full" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                    <Skeleton className="h-24 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
