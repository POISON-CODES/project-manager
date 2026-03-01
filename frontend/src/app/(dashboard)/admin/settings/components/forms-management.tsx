"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    FileText,
    MoreHorizontal,
    Eye,
    Copy,
    Trash2,
    CheckCircle2,
    AlertCircle,
    FormInput,
    History,
    PlusSquare,
    Settings2,
    Layers,
    Loader2,
    ArrowRight,
    Calendar,
    ChevronRight,
    User,
    ExternalLink,
    Search
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formService } from "@/services/form.service";
import { FormTemplate, Project } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function FormsManagement() {
    const router = useRouter();
    const [forms, setForms] = React.useState<FormTemplate[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isDesignModalOpen, setIsDesignModalOpen] = React.useState(false);
    const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isLoadingSubmissions, setIsLoadingSubmissions] = React.useState(false);

    const [selectedForm, setSelectedForm] = React.useState<FormTemplate | null>(null);
    const [submissions, setSubmissions] = React.useState<Project[]>([]);

    const [newForm, setNewForm] = React.useState({
        title: "",
        description: "",
        schema: {
            title: "Project Intake",
            type: "object",
            properties: {}
        }
    });

    const fetchForms = async () => {
        try {
            setIsLoading(true);
            const data = await formService.getForms();
            setForms(data);
        } catch (error) {
            console.error("Failed to fetch forms:", error);
            toast.error("Failed to load intake forms");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateForm = async () => {
        if (!newForm.title) {
            toast.error("Form title is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await formService.createForm(newForm);
            toast.success("Protocol initialized successfully");
            setIsDesignModalOpen(false);

            // --- Architectural Handover ---
            // Redirect to the dedicated Protocol Architect for structural design
            if (result?.data?.id) {
                router.push(`/admin/forms/${result.data.id}/edit`);
            } else {
                fetchForms();
            }
        } catch (error: any) {
            toast.error("Failed to deploy protocol");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewSubmissions = async (form: FormTemplate) => {
        setSelectedForm(form);
        setIsSubmissionsModalOpen(true);
        setIsLoadingSubmissions(true);
        try {
            const data = await formService.getSubmissions(form.id);
            setSubmissions(data);
        } catch (error) {
            console.error("Failed to fetch submissions:", error);
            toast.error("Failed to load submission history");
        } finally {
            setIsLoadingSubmissions(false);
        }
    };

    const navigateToSubmission = (submissionId: string) => {
        if (!selectedForm) return;
        router.push(`/admin/forms/${selectedForm.id}/submissions/${submissionId}`);
    };

    const handleToggleActive = async (form: FormTemplate) => {
        const newState = !form.isActive;

        // Optimistic local update for zero-latency UI
        setForms(prev => prev.map(f =>
            f.id === form.id ? { ...f, isActive: newState } : f
        ));

        try {
            await formService.updateForm(form.id, { isActive: newState });
            toast.success(newState ? "Protocol reactivated" : "Protocol decommissioned");
        } catch (error) {
            // Revert state on failure
            setForms(prev => prev.map(f =>
                f.id === form.id ? { ...f, isActive: !newState } : f
            ));
            toast.error("Status synchronization failed");
        }
    };

    React.useEffect(() => {
        fetchForms();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[300px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-black tracking-tight flex items-center gap-2 uppercase italic">
                        <FormInput className="h-5 w-5 text-primary" />
                        Intake Infrastructure
                    </h3>
                    <p className="text-xs text-muted-foreground italic">Gobernance of dynamic protocols and systemic initialization.</p>
                </div>
                <Button className="font-black gap-2 shadow-lg shadow-primary/20 bg-foreground text-background hover:bg-foreground/90 transition-all rounded-xl" onClick={() => setIsDesignModalOpen(true)}>
                    <PlusSquare className="h-4 w-4" /> Initialize Protocol
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {forms.map((form) => (
                    <Card
                        key={form.id}
                        className={cn(
                            "bg-surface/40 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-all group relative overflow-hidden cursor-pointer active:scale-[0.98]",
                            !form.isActive && "opacity-60 grayscale-[0.6] hover:grayscale-0 transition-[filter,opacity]"
                        )}
                        onClick={() => {
                            if (!form.isActive) {
                                toast.info("Protocol deactivated. Activate to enable refinement.");
                                return;
                            }
                            router.push(`/admin/forms/${form.id}/preview`);
                        }}
                    >
                        {form.isDefault && (
                            <div className="absolute top-0 right-0">
                                <Badge className="rounded-none rounded-bl-xl bg-primary text-[8px] font-black uppercase tracking-[0.2em] px-3 h-6">System Terminal</Badge>
                            </div>
                        )}
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 text-primary group-hover:scale-110 transition-transform">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary rounded-full">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-surface/95 backdrop-blur-2xl border-border p-2 min-w-[160px]">
                                        <DropdownMenuItem onClick={() => router.push(`/admin/forms/${form.id}/preview`)} className="text-[10px] font-black uppercase tracking-widest gap-3 h-10 rounded-lg cursor-pointer">
                                            <Eye className="h-3.5 w-3.5" /> Preview Mode
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-[10px] font-black uppercase tracking-widest gap-3 h-10 rounded-lg cursor-pointer">
                                            <Copy className="h-3.5 w-3.5" /> Duplicate Logic
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-border/50 my-1" />
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleActive(form);
                                            }}
                                            className={cn(
                                                "text-[10px] font-black uppercase tracking-widest gap-3 h-10 rounded-lg cursor-pointer transition-colors",
                                                form.isActive ? "text-destructive focus:bg-destructive/10" : "text-emerald-500 focus:bg-emerald-500/10"
                                            )}
                                        >
                                            {form.isActive ? (
                                                <>
                                                    <Trash2 className="h-3.5 w-3.5" /> Purge Protocol
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-3.5 w-3.5" /> Reactivate Protocol
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <CardTitle className="text-xl font-black tracking-tight group-hover:text-primary transition-colors italic uppercase">{form.title}</CardTitle>
                            <CardDescription className="italic line-clamp-2 opacity-70">
                                {form.description || "No description provided for this intake template."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <div className="flex items-center gap-8">
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Logic Flow</p>
                                    <p className="text-xs font-bold">{form.fields?.length || 0} Inputs</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Protocol Version</p>
                                    <p className="text-xs font-bold">v{form.version}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Total Entries</p>
                                    <p className="text-xs font-bold text-primary italic">ACTIVE</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/5 border-t border-border/10 p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {form.isActive ? (
                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500 border-emerald-500/20 bg-emerald-500/5 gap-1 px-2 h-5">
                                        <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" /> Live
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground border-border/50 bg-muted/5 gap-1 px-2 h-5">
                                        Off-line
                                    </Badge>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/10 hover:text-primary transition-all rounded-lg"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewSubmissions(form);
                                }}
                            >
                                <History className="h-3 w-3" /> View Submissions
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {forms.length === 0 && (
                    <div className="col-span-full py-24 text-center border-2 border-dashed border-border/20 rounded-[2.5rem] opacity-30 flex flex-col items-center justify-center">
                        <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-6">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">No Infrastructure Detected</p>
                    </div>
                )}
            </div>

            {/* View Submissions Dialog */}
            <Dialog open={isSubmissionsModalOpen} onOpenChange={setIsSubmissionsModalOpen}>
                <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 bg-surface/95 backdrop-blur-2xl border-border shadow-2xl rounded-[2rem] overflow-hidden">
                    <DialogHeader className="p-8 pb-4 flex-none border-b border-border/50">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                                    <History className="h-6 w-6 text-primary" />
                                    Submission History
                                </DialogTitle>
                                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">
                                    Audit trail for protocol: <span className="text-primary">{selectedForm?.title}</span>
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-col">
                        {isLoadingSubmissions ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Scanning Datastore...</p>
                            </div>
                        ) : submissions.length > 0 ? (
                            <ScrollArea className="flex-1 px-8 py-4">
                                <div className="space-y-3 pb-8">
                                    {submissions.map((sub) => (
                                        <div
                                            key={sub.id}
                                            className="group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-[1.5rem] bg-background/50 border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer active:scale-[0.99]"
                                            onClick={() => navigateToSubmission(sub.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 rounded-xl bg-surface border border-border/50 shadow-sm">
                                                    <Layers className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="space-y-0.5 text-left">
                                                    <h4 className="text-[13px] font-black uppercase tracking-tight truncate max-w-[200px] md:max-w-xs">{sub.name}</h4>
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1 group-hover:text-foreground">
                                                            <Calendar className="h-2.5 w-2.5" /> {new Date(sub.createdAt).toLocaleDateString()}
                                                        </p>
                                                        <div className="h-1 w-1 rounded-full bg-border" />
                                                        <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                                                            <User className="h-2.5 w-2.5" /> {sub.owner?.name || "Unverified Requester"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 mt-4 md:mt-0">
                                                <Badge className="bg-muted-foreground/10 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary border-none text-[8px] font-black uppercase px-3 h-5">
                                                    {sub.status}
                                                </Badge>
                                                <div className="h-8 w-8 rounded-full border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all">
                                                    <ChevronRight className="h-4 w-4 text-primary" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center opacity-30">
                                <div className="h-12 w-12 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-4">
                                    <Search className="h-6 w-6" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest italic">No active submissions found for this protocol.</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-6 border-t border-border/20 bg-muted/5">
                        <Button variant="outline" onClick={() => setIsSubmissionsModalOpen(false)} className="rounded-xl font-bold h-11 px-8 text-[10px] uppercase tracking-widest">Close Record</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Design New Form Dialog */}
            <Dialog open={isDesignModalOpen} onOpenChange={setIsDesignModalOpen}>
                <DialogContent className="sm:max-w-[600px] bg-surface/95 backdrop-blur-2xl border-border shadow-2xl rounded-[2.5rem]">
                    <DialogHeader className="p-4">
                        <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tighter uppercase italic">
                            <PlusSquare className="h-7 w-7 text-primary" />
                            Architect Protocol
                        </DialogTitle>
                        <DialogDescription className="italic font-medium">
                            Envision and define the structural requirements for new project initiatives.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-6 px-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Protocol Identification</Label>
                                <Input
                                    placeholder="e.g. Enterprise Software Pipeline"
                                    value={newForm.title}
                                    onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                                    className="bg-background/40 border-border h-12 text-sm font-bold rounded-2xl focus-visible:ring-primary/20"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Operational Summary</Label>
                                <Textarea
                                    placeholder="Clarify the mission and objectives of this intake protocol..."
                                    value={newForm.description}
                                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                                    className="bg-background/40 border-border min-h-[120px] text-sm italic rounded-2xl focus-visible:ring-primary/20"
                                />
                            </div>
                        </div>

                        <div className="p-6 rounded-[1.75rem] bg-primary/5 border border-primary/10 space-y-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Settings2 className="h-12 w-12" />
                            </div>
                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                <Settings2 className="h-4 w-4" /> Systemic Integration
                            </h5>
                            <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                                This protocol will be deployed to the production environment. Subsequent schema refinements can be performed via the <span className="text-primary italic">Protocol Editor</span> after initialization.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="p-4 pt-0">
                        <Button variant="ghost" onClick={() => setIsDesignModalOpen(false)} className="font-bold text-[10px] uppercase tracking-widest rounded-xl h-12 px-6">Abort Mission</Button>
                        <Button
                            onClick={handleCreateForm}
                            disabled={isSubmitting}
                            className="font-black gap-2 shadow-xl shadow-primary/20 bg-foreground text-background hover:bg-foreground/90 transition-all rounded-xl h-12 px-8 text-[10px] uppercase tracking-widest"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
                            Deploy Protocol
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
