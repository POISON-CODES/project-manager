"use client";

import * as React from "react";
import {
    Plus,
    FileText,
    MoreVertical,
    Edit,
    Trash2,
    ExternalLink,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Database
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { FormTemplate } from "@/types";
import { FormBuilder } from "./components/form-builder";

import { formService } from "@/services/form.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AdminFormsPage() {
    const router = useRouter();
    const [templates, setTemplates] = React.useState<FormTemplate[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isEditorOpen, setIsEditorOpen] = React.useState(false);
    const [selectedTemplate, setSelectedTemplate] = React.useState<FormTemplate | undefined>(undefined);

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            const data = await formService.getForms();
            setTemplates(data);
        } catch (error) {
            toast.error("Failed to sync protocol library");
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchTemplates();
    }, []);

    const handleCreate = () => {
        setSelectedTemplate(undefined);
        setIsEditorOpen(true);
    };

    const handleEdit = (template: FormTemplate) => {
        router.push(`/admin/forms/${template.id}/edit`);
    };

    const handleSave = async (data: Partial<FormTemplate>) => {
        try {
            const result = await formService.createForm(data);
            toast.success("Protocol initialized successfully");

            // Redirect to edit page for structural design
            if (result.data && result.data.id) {
                router.push(`/admin/forms/${result.data.id}/edit`);
            } else {
                fetchTemplates();
                setIsEditorOpen(false);
            }
        } catch (error) {
            toast.error("Failed to deploy protocol");
        }
    };

    const deleteTemplate = (id: string) => {
        // Implement delete in service
        toast.info("Deletion protocol initiated (Service Pending)");
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Syncing Library...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                <FormBuilder template={selectedTemplate} onSave={handleSave} />
            </Dialog>

            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Form Management
                    </h1>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                        <Database className="h-3 w-3" /> Protocol Library Active
                        <span className="opacity-30">•</span>
                        <span className="text-primary italic">Architecture Mode</span>
                    </p>
                </div>
                <Button className="font-black text-[10px] uppercase tracking-[0.2em] gap-2 h-12 px-8 rounded-2xl shadow-xl shadow-primary/20" onClick={handleCreate}>
                    <Plus className="h-4 w-4" /> Create Template
                </Button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-surface/30 border-border p-5 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText className="h-12 w-12 text-primary" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Active Protocols</p>
                    <p className="text-3xl font-black tracking-tighter italic">{templates.filter(t => t.isActive).length}</p>
                </Card>
                <Card className="bg-surface/30 border-border p-5 rounded-2xl relative overflow-hidden group">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Submissions</p>
                    <p className="text-3xl font-black tracking-tighter italic">148</p>
                </Card>
                <Card className="bg-surface/30 border-border p-5 rounded-2xl relative overflow-hidden group">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Default Schema</p>
                    <p className="text-sm font-black uppercase text-primary truncate italic mt-2">
                        {templates.find(t => t.isDefault)?.title || "Not Assigned"}
                    </p>
                </Card>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground/50" />
                    <Input placeholder="Search protocols..." className="pl-11 h-12 bg-surface/40 border-border/50 rounded-2xl text-[11px] font-bold uppercase tracking-widest" />
                </div>
                <Button variant="outline" className="h-12 px-6 gap-2 border-border rounded-2xl text-[10px] font-black uppercase tracking-widest bg-surface/30">
                    <Filter className="h-4 w-4" /> Refine View
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <Card
                        key={template.id}
                        className={cn(
                            "bg-surface/20 border-border/50 transition-all hover:bg-surface/40 hover:border-primary/30 rounded-[2rem] overflow-hidden flex flex-col group cursor-pointer backdrop-blur-sm shadow-sm",
                            !template.isActive && "opacity-60 grayscale-[0.8]"
                        )}
                        onClick={() => router.push(`/admin/forms/${template.id}/preview`)}
                    >
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500 shadow-inner">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div className="flex items-center gap-2">
                                    {template.isDefault && (
                                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[8px] uppercase font-black tracking-widest h-5">PRIMARY</Badge>
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-primary/10 transition-colors">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-surface/70 backdrop-blur-md border border-border rounded-xl p-1 shadow-2xl">
                                            <DropdownMenuItem className="cursor-pointer gap-2 text-[10px] font-black uppercase tracking-widest rounded-lg" onClick={(e) => { e.stopPropagation(); handleEdit(template); }}>
                                                <Edit className="h-4 w-4" /> Edit Template
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer gap-2 text-[10px] font-black uppercase tracking-widest rounded-lg" onClick={(e) => { e.stopPropagation(); router.push(`/admin/forms/${template.id}/preview`); }}>
                                                <ExternalLink className="h-4 w-4" /> Preview Live
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="cursor-pointer gap-2 text-[10px] font-black uppercase tracking-widest rounded-lg text-destructive" onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id); }}>
                                                <Trash2 className="h-4 w-4" /> Decommission
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <div className="mt-4 space-y-1 min-h-[5.5rem] flex flex-col justify-start">
                                <CardTitle className="text-xl font-black tracking-tighter uppercase italic">{template.title}</CardTitle>
                                <CardDescription className="line-clamp-3 mt-1 text-[11px] font-medium leading-relaxed italic">
                                    {template.description || "Systemic protocol initialized. Documentation pending."}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-8 pb-6 flex-1">
                            <div className="space-y-3 pt-4 border-t border-border/20">
                                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-muted-foreground">Revision</span>
                                    <span className="font-mono text-primary">v{template.version}</span>
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-muted-foreground">Schema Density</span>
                                    <span className="text-foreground">{template.fields.length} Inputs</span>
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-muted-foreground">Stability</span>
                                    {template.isActive ? (
                                        <span className="flex items-center gap-1.5 text-success">
                                            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Live
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Staging
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="px-8 py-6 border-t border-border/20 bg-primary/5">
                            <Button
                                variant="ghost"
                                className="w-full text-[10px] font-black uppercase tracking-[0.2em] gap-2 hover:text-primary hover:bg-transparent group/btn"
                                onClick={(e) => { e.stopPropagation(); router.push(`/admin/forms/${template.id}/submissions`); }}
                            >
                                Analysis Panel <ChevronRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {/* Create New Placeholder */}
                <button
                    className="h-full min-h-[280px] border-2 border-dashed border-border/20 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all group relative overflow-hidden"
                    onClick={handleCreate}
                >
                    <div className="h-14 w-14 rounded-2xl bg-muted/20 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-110 transition-all duration-500 border border-border/30">
                        <Plus className="h-7 w-7" />
                    </div>
                    <div className="text-center space-y-1 z-10">
                        <p className="font-black uppercase tracking-widest text-xs italic">Protocol Initializer</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-50">Architect dynamic intake flows</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>
        </div>
    );
}
