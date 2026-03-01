"use client";

import * as React from "react";
import {
    Send,
    Layers,
    Building2,
    Briefcase,
    Tags,
    Calendar as CalendarIcon,
    FileUp,
    CheckCircle2,
    Loader2,
    X,
    FolderPlus,
    ChevronDown,
    AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { projectService } from "@/services/project.service";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PROJECT_TYPES = [
    { id: "paid", label: "Paid Implementation" },
    { id: "presales", label: "Pre-Sales Demo" }
];

const PROJECT_CATEGORIES = [
    { id: "bot", label: "Bot Implementation" },
    { id: "crm", label: "CRM Integration" },
    { id: "payment", label: "Payment Service" },
    { id: "ai", label: "AI Bot" },
    { id: "others", label: "Others" }
];

export default function GenericIntakePage() {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
    const [projectType, setProjectType] = React.useState<string | null>(null);
    const [deadline, setDeadline] = React.useState("");
    const [showDescription, setShowDescription] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [projectName, setProjectName] = React.useState("");
    const [orgId, setOrgId] = React.useState("");
    const [otherDescription, setOtherDescription] = React.useState("");
    const [showConfirm, setShowConfirm] = React.useState(false);
    const formRef = React.useRef<HTMLFormElement>(null);
    const dateInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const toggleCategory = (categoryId: string) => {
        const next = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId];

        setSelectedCategories(next);
        setShowDescription(next.includes("others"));
    };

    const validateForm = () => {
        if (!projectName.trim()) { toast.error("Strategic Project Name is required."); return false; }
        if (!orgId.trim()) { toast.error("Organization Identifier is required."); return false; }
        if (!projectType) { toast.error("Project Classification must be selected."); return false; }
        if (!deadline) { toast.error("Strategic Deadline must be defined."); return false; }
        if (selectedCategories.length === 0) { toast.error("At least one Requirement Vector must be identified."); return false; }
        if (showDescription && !otherDescription.trim()) { toast.error("Specification Override details are mandatory for 'Others'."); return false; }
        return true;
    };

    const handleAuthorizeClick = () => {
        if (validateForm()) {
            setShowConfirm(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!projectType) {
            toast.error("Please select a project classification.");
            return;
        }
        setIsSubmitting(true);

        let docUrl = null;
        if (selectedFile) {
            try {
                docUrl = await projectService.uploadDocument(selectedFile);
            } catch (err: any) {
                toast.error("Resource Vaulting Failure: Documentation storage protocol failed.");
                setIsSubmitting(false);
                return;
            }
        }

        const data = {
            name: projectName,
            orgId: orgId,
            type: projectType,
            categories: selectedCategories,
            otherDescription: otherDescription,
            deadline: deadline,
        };

        try {
            await projectService.createProject({
                name: data.name,
                description: `Org: ${data.orgId} | Type: ${data.type} | Categories: ${data.categories.join(", ")}${data.otherDescription ? ` | Notes: ${data.otherDescription}` : ""}`,
                formTemplateId: "generic-intake-form",
                formData: {
                    ...data,
                    specDoc: docUrl,
                    specDocName: selectedFile?.name,
                    submittedAt: new Date().toISOString(),
                    source: "GENERIC_PROJECT_INTAKE_PAGE"
                },
                deadline: data.deadline || undefined
            });

            toast.success("Project protocol initialized successfully.");
            setIsSuccess(true);
            setSelectedFile(null);
            setDeadline("");
            setSelectedCategories([]);
            setProjectType(null);
            setProjectName("");
            setOrgId("");
            setOtherDescription("");
            setShowConfirm(false);
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error("Deployment failed. Please check your uplink.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formattedDate = deadline ? format(new Date(deadline), "dd-MM-yyyy").toUpperCase() : "DD-MM-YYYY";

    if (isSuccess) {
        return (
            <div className="flex h-[calc(100vh-8rem)] items-center justify-center p-6 bg-background/50">
                <div className="max-w-md w-full flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="h-24 w-24 rounded-[2rem] bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-2xl shadow-primary/20 rotate-12">
                        <CheckCircle2 className="h-12 w-12 text-primary -rotate-12" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-4xl font-black  uppercase tracking-tighter">Mission Logged</h1>
                        <p className="text-muted-foreground text-sm  font-medium leading-relaxed">
                            The project architecture has been successfully injected into the global workflow.
                            Stand by for coordination from the Operations Center.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setIsSuccess(false)}
                        className="font-black  uppercase tracking-widest text-[10px] h-12 px-10 border-primary/20 hover:bg-primary/5"
                    >
                        Initialize New Sequence
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-8rem)] bg-background overflow-y-auto custom-scrollbar">
            <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-20 p-8 lg:p-10 items-start">
                {/* Left Tactical Control Column */}
                <div className="lg:sticky lg:top-8 space-y-10 animate-in fade-in slide-in-from-left-4 duration-1000">
                    <div className="space-y-5">
                        <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20 font-black tracking-[0.2em] text-[8px] px-3 py-1 uppercase">Operational Gateway</Badge>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black uppercase tracking-tighter leading-[0.9] flex flex-col">
                                <span className="flex items-center gap-3">
                                    <FolderPlus className="h-10 w-10 text-primary shrink-0" />
                                    Project
                                </span>
                                <span>Initialization</span>
                            </h1>
                            <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.15em] max-w-xs opacity-70 leading-relaxed">
                                Deploy original resource requirements through this secure gateway to authorize new project lifecycles.
                            </p>
                        </div>
                    </div>

                    {/* Integrated Submission Logic */}
                    <div className="space-y-6 pt-8 border-t border-border/10 flex flex-col items-start text-left">
                        <div className="w-full space-y-4">
                            <Button
                                type="button"
                                onClick={handleAuthorizeClick}
                                disabled={isSubmitting}
                                className="w-full h-16 px-8 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/10 hover:shadow-primary/30 transition-all rounded-2xl gap-3 text-sm group"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Synchronizing...
                                    </>
                                ) : (
                                    <>
                                        Authorize Initiative
                                        <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </Button>

                            <div className="bg-accent/5 border border-border/10 p-5 rounded-xl space-y-2 shadow-inner">
                                <div className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Mission Status</span>
                                </div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-80 tracking-[0.15em] leading-relaxed">
                                    Submissions are synchronized directly with global architecture queues. Authentication bypass protocol active.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 font-black uppercase tracking-[0.3em] text-[7px] text-muted-foreground opacity-20">
                            <span>Protocol-Alpha</span>
                            <span>Direct-Entry</span>
                        </div>
                    </div>
                </div>

                {/* Right Architecture Workspace */}
                <div className="animate-in fade-in zoom-in-95 duration-1000 delay-300">
                    <Card className="bg-surface/40 backdrop-blur-3xl border-border/50 shadow-2xl rounded-3xl overflow-hidden group relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-600 to-primary" />

                        <CardContent className="p-10">
                            <form id="generic-intake-form" ref={formRef} onSubmit={handleSubmit} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Project Name */}
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-primary/80 flex items-center gap-2 mb-1 ml-1">
                                            <Layers className="h-3 w-3" /> Strategic Project Name
                                        </Label>
                                        <Input
                                            name="name"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                            placeholder="E.G., TITAN FRAMEWORK DEPLOYMENT"
                                            required
                                            className="bg-accent/5 border-border/20 h-14 rounded-xl font-black tracking-tight focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all text-xs px-5 shadow-inner"
                                        />
                                    </div>

                                    {/* Org ID */}
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-primary/80 flex items-center gap-2 mb-1 ml-1">
                                            <Building2 className="h-3 w-3" /> Organization Identifier
                                        </Label>
                                        <Input
                                            name="orgId"
                                            value={orgId}
                                            onChange={(e) => setOrgId(e.target.value)}
                                            placeholder="org_abcdefgh"
                                            required
                                            className="bg-accent/5 border-border/20 h-14 rounded-xl font-black tracking-widest focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all text-xs px-5 shadow-inner"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Project Classification */}
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-primary/80 flex items-center gap-2 mb-1 ml-1">
                                            <Briefcase className="h-3 w-3" /> Project Classification
                                        </Label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    className={cn(
                                                        "w-full h-14 justify-between bg-accent/5 border-border/20 rounded-xl px-5 group transition-all hover:bg-accent/10 shadow-inner",
                                                        projectType && "border-primary/30 bg-accent/5"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-500", projectType ? "bg-primary text-white scale-110" : "bg-muted text-muted-foreground group-hover:text-primary")}>
                                                            <Briefcase className="h-3.5 w-3.5" />
                                                        </div>
                                                        <span className={cn("text-[11px] font-black uppercase tracking-widest truncate", projectType ? "text-foreground/90" : "text-muted-foreground")}>
                                                            {projectType ? PROJECT_TYPES.find(t => t.id === projectType)?.label : "Select Classification"}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-all opacity-40 shrink-0" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-1 bg-surface/95 backdrop-blur-3xl border-border rounded-xl shadow-2xl" align="start">
                                                {PROJECT_TYPES.map((type) => (
                                                    <DropdownMenuItem
                                                        key={type.id}
                                                        onClick={() => setProjectType(type.id)}
                                                        className={cn(
                                                            "flex items-center gap-2 text-[11px] font-black uppercase tracking-widest p-3 rounded-lg cursor-pointer transition-all mb-0.5 last:mb-0",
                                                            projectType === type.id ? "bg-primary text-primary-foreground" : "hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        {type.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Deadline Interface */}
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-primary/80 flex items-center gap-2 mb-1 ml-1">
                                            <CalendarIcon className="h-3 w-3" /> Strategic Deadline
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <div
                                                    className="relative group/date cursor-pointer"
                                                >
                                                    <div
                                                        className={cn(
                                                            "w-full h-14 bg-accent/5 border border-border/20 rounded-xl px-5 flex items-center justify-between transition-all group-hover/date:border-primary/20 shadow-inner",
                                                            deadline && "border-primary/30"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2 pointer-events-none">
                                                            <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-500", deadline ? "bg-primary text-white scale-110" : "bg-muted text-muted-foreground")}>
                                                                <CalendarIcon className="h-3.5 w-3.5" />
                                                            </div>
                                                            <span className={cn("text-[11px] font-black uppercase tracking-[0.1em] transition-colors", deadline ? "text-foreground/90 no-underline" : "text-muted-foreground")}>
                                                                {deadline ? format(new Date(deadline), "PPP") : "Select Strategic Deadline"}
                                                            </span>
                                                        </div>
                                                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-all opacity-40 shrink-0" />
                                                    </div>
                                                </div>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-surface/95 backdrop-blur-3xl border-border rounded-2xl shadow-2xl" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={deadline ? new Date(deadline) : undefined}
                                                    onSelect={(date) => setDeadline(date ? date.toISOString() : "")}
                                                    disabled={{ before: addDays(new Date(), 1) }}
                                                    className="p-4"
                                                    classNames={{
                                                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground opacity-100",
                                                        day_today: "bg-accent/10 text-primary font-black",
                                                        day_disabled: "text-muted-foreground/20 opacity-50 cursor-not-allowed",
                                                        head_cell: "text-muted-foreground font-black uppercase text-[8px] tracking-widest pb-4",
                                                        cell: "text-[10px] font-bold uppercase tracking-widest",
                                                        nav_button: "hover:bg-primary/10 text-primary rounded-lg transition-colors",
                                                        caption: "flex justify-center pt-2 relative items-center mb-4",
                                                        caption_label: "text-[10px] font-black uppercase tracking-[0.2em] text-primary"
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {/* Hidden input for form submission */}
                                        <input type="hidden" name="deadline" value={deadline} required />
                                    </div>

                                    {/* Requirement Vectors */}
                                    <div className="space-y-3">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-primary/80 flex items-center gap-2 mb-1 ml-1">
                                            <Tags className="h-3 w-3" /> Requirement Vectors
                                        </Label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    className={cn(
                                                        "w-full h-14 justify-between bg-accent/5 border-border/20 rounded-xl px-5 group transition-all hover:bg-accent/10 shadow-inner",
                                                        selectedCategories.length > 0 && "border-primary/30 bg-accent/5"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center transition-all duration-500 relative", selectedCategories.length > 0 ? "bg-primary text-white text-[9px] font-black scale-110" : "bg-muted text-muted-foreground group-hover:text-primary")}>
                                                            {selectedCategories.length > 0 ? selectedCategories.length : <Tags className="h-3.5 w-3.5" />}
                                                        </div>
                                                        <span className={cn("text-[11px] font-black uppercase tracking-widest truncate", selectedCategories.length > 0 ? "text-foreground/90" : "text-muted-foreground")}>
                                                            {selectedCategories.length > 0
                                                                ? `${selectedCategories.length} Vector${selectedCategories.length > 1 ? 's' : ''} Identified`
                                                                : "Map Initiative Vectors"}
                                                        </span>
                                                    </div>
                                                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-all opacity-40 shrink-0" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-1.5 bg-surface/95 backdrop-blur-3xl border-border rounded-xl shadow-2xl overflow-hidden" align="start">
                                                <div className="p-1.5 border-b border-border/10 mb-1.5 flex items-center justify-between">
                                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Select Vectors</h4>
                                                    {selectedCategories.length > 0 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            type="button"
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedCategories([]); setShowDescription(false); setSelectedFile(null); }}
                                                            className="h-6 text-[11px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 px-2 rounded-md"
                                                        >
                                                            Reset
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="p-1 space-y-1 max-h-[250px] overflow-y-auto custom-scrollbar">
                                                    {PROJECT_CATEGORIES.map(category => (
                                                        <DropdownMenuItem
                                                            key={category.id}
                                                            onSelect={(e) => e.preventDefault()}
                                                            className={cn(
                                                                "flex items-center gap-2 p-2.5 hover:bg-primary/5 rounded-lg transition-all cursor-pointer group/item",
                                                                selectedCategories.includes(category.id) && "bg-accent/5"
                                                            )}
                                                            onClick={() => toggleCategory(category.id)}
                                                        >
                                                            <Checkbox checked={selectedCategories.includes(category.id)} className="rounded-md h-4 w-4 pointer-events-none" />
                                                            <span className={cn("text-[11px] font-black uppercase tracking-widest transition-colors", selectedCategories.includes(category.id) ? "text-primary" : "text-foreground/70 group-hover/item:text-foreground")}>
                                                                {category.label}
                                                            </span>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>


                                {/* Optional Description */}
                                {showDescription && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
                                        <Label className="text-[9px] font-black uppercase tracking-widest text-yellow-500 flex items-center gap-2 mb-1 ml-1">
                                            <AlertCircle className="h-3 w-3" /> Requirement Specification Override
                                        </Label>
                                        <Textarea
                                            name="otherDescription"
                                            value={otherDescription}
                                            onChange={(e) => setOtherDescription(e.target.value)}
                                            placeholder="Please provide specific details for the 'Others' classification..."
                                            required={showDescription}
                                            className="bg-yellow-500/[0.03] border-yellow-500/20 rounded-2xl min-h-[120px] font-medium leading-relaxed resize-none focus-visible:ring-yellow-500/10 focus-visible:border-yellow-500/30 p-5 text-xs shadow-inner"
                                        />
                                    </div>
                                )}

                                {/* File Upload Interface */}
                                <div className="space-y-5 pt-5 border-t border-border/10">
                                    <Label className="text-[9px] font-black uppercase tracking-widest text-primary/80 flex items-center gap-2 mb-1 ml-1">
                                        <FileUp className="h-3 w-3" /> Technical Specification Dossier
                                    </Label>
                                    <div className="relative group/file">
                                        <Input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            className="hidden"
                                            id="file-upload"
                                            onChange={handleFileChange}
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className={cn(
                                                "flex flex-col items-center justify-center w-full min-h-[144px] border-[3px] border-dashed border-border/40 rounded-3xl bg-accent/5 cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all group-hover/file:border-primary/20 shadow-inner p-6",
                                                selectedFile && "border-primary/40 bg-primary/5 border-solid"
                                            )}
                                        >
                                            {!selectedFile ? (
                                                <>
                                                    <div className="h-14 w-14 rounded-2xl bg-surface flex items-center justify-center mb-4 shadow-xl group-hover/file:scale-110 transition-transform duration-700 border border-border/10">
                                                        <FileUp className="h-6 w-6 text-muted-foreground group-hover/file:text-primary transition-colors" />
                                                    </div>
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground group-hover/file:text-foreground px-4 text-center">
                                                        Upload Requirements Dossier (PDF/DOC)
                                                    </span>
                                                </>
                                            ) : (
                                                <div className="w-full flex items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                                                    <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 shrink-0">
                                                        <CheckCircle2 className="h-8 w-8 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-left">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Resource Mapped</span>
                                                            <Badge variant="outline" className="text-[8px] font-black uppercase text-primary border-primary/20 h-4">{selectedFile.name.split('.').pop()}</Badge>
                                                        </div>
                                                        <h4 className="text-[11px] font-black uppercase tracking-tight text-foreground truncate max-w-md">
                                                            {selectedFile.name}
                                                        </h4>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <div className="flex flex-col">
                                                                <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Payload Size</span>
                                                                <span className="text-[10px] font-black text-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                                            </div>
                                                            <div className="w-px h-6 bg-border/20" />
                                                            <div className="flex flex-col">
                                                                <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Status</span>
                                                                <span className="text-[10px] font-black text-green-500 uppercase">Ready</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedFile(null); }}
                                                        className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all shrink-0"
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="mt-6 opacity-10 pointer-events-none flex items-center justify-center overflow-hidden whitespace-nowrap">
                        <div className="flex gap-12 font-black uppercase tracking-[0.8em] text-[8px] text-muted-foreground animate-pulse">
                            <span>System-Level-Override</span>
                            <span>Manual-Bypass-Alpha</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Gateway Dialog */}
            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent className="bg-surface/95 backdrop-blur-3xl border-border/50 rounded-[2.5rem] p-8 !max-w-[50%] !sm:max-w-[50%] w-full">
                    <AlertDialogHeader className="space-y-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <AlertCircle className="h-6 w-6 text-primary" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Deployment Authorization</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground font-medium text-sm leading-relaxed">
                            Confirm the following project parameters for mission injection. This action will initiate global synchronization.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="my-6 space-y-4 bg-accent/5 rounded-2xl p-6 border border-border/10">
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Project Name</p>
                                <p className="text-[14px] font-bold tracking-tight truncate">{projectName}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Organization</p>
                                <p className="text-[14px] font-bold tracking-tight">{orgId}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Classification</p>
                                <p className="text-[14px] font-bold tracking-tight">{PROJECT_TYPES.find(t => t.id === projectType)?.label}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-primary/60">Strategic Deadline</p>
                                <p className="text-[14px] font-bold tracking-tight">{deadline ? format(new Date(deadline), "PPP") : "N/A"}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8 pt-2 border-t border-border/10">
                            {/* Left: Vectors */}
                            <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-widest text-primary/60">Requirement Vectors</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedCategories.map((cat: string) => (
                                        <Badge key={cat} variant="outline" className="text-[9px] font-bold bg-primary/5 text-primary border-primary/10">
                                            {PROJECT_CATEGORIES.find(c => c.id === cat)?.label}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Document Details */}
                            <div>
                                {selectedFile ? (
                                    <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-xl p-3 animate-in fade-in zoom-in-95 duration-500">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <FileUp className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold truncate leading-tight">{selectedFile.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[8px] font-black text-muted-foreground uppercase">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                                <span className="text-[8px] font-black text-green-500 uppercase flex items-center gap-1">
                                                    <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                                                    Ready
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-3">
                                        <AlertCircle className="h-3.5 w-3.5 text-yellow-500 shrink-0 mt-0.5" />
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500">No Dossier</p>
                                            <p className="text-[8px] text-yellow-500/70 font-medium leading-tight">Proceeding without technical documentation.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="h-12 border-border/50 font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-accent/10 px-6">
                            Abort
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => formRef.current?.requestSubmit()}
                            className="h-12 bg-primary text-white hover:bg-primary/90 font-black uppercase tracking-widest text-[11px] rounded-xl px-8 shadow-xl shadow-primary/20"
                        >
                            Finalize Submission
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
