"use client";

import { formService } from "@/services/form.service";
import {
    CheckCircle2,
    FileText,
    Database,
    Layers,
    Activity,
    ArrowRight,
    Loader2
} from "lucide-react";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FormTemplate } from "@/types";
import { FeatureGuard } from "@/components/shared/feature-guard";

import { FallbackIntakeForm } from "@/components/domain/fallback-intake-form";

/**
 * Intake Page.
 * Allows users to choose a protocol and submit new project requests.
 */
export default function IntakePage() {
    const router = useRouter();
    const [templates, setTemplates] = React.useState<FormTemplate[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setIsLoading(true);
                const data = await formService.getForms();
                setTemplates(data.filter(t => t.isActive));
            } catch (err) {
                toast.error("Failed to sync protocol library");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Syncing Library...</p>
                </div>
            </div>
        );
    }

    return (
        <FeatureGuard feature="INTAKE">
            <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 py-10">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                        <Layers className="h-3 w-3" /> System Triage Protocol
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Intake Infrastructure
                    </h1>
                    <p className="text-muted-foreground max-w-2xl italic leading-relaxed">
                        Select a formalized requirement protocol to initiate a new project initialization sequence.
                        Each template is calibrated for specific architectural standards.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                        <Card
                            key={template.id}
                            className="bg-surface/20 border-border/50 transition-all hover:bg-surface/40 hover:border-primary/30 rounded-[2rem] overflow-hidden flex flex-col group cursor-pointer backdrop-blur-sm shadow-sm"
                            onClick={() => router.push(`/intake/${template.id}`)}
                        >
                            <CardHeader className="p-8 pb-4">
                                <div className="p-3 w-fit rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500 shadow-inner mb-4">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-black tracking-tighter uppercase italic">{template.title}</CardTitle>
                                    <CardDescription className="line-clamp-2 mt-1 text-[11px] font-medium leading-relaxed italic h-8">
                                        {template.description || "Deploying systemic requirements via secure injection."}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="px-8 pb-8 flex-1">
                                <div className="space-y-4 pt-4 border-t border-border/20">
                                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                        <span className="text-muted-foreground flex items-center gap-1.5"><Activity className="h-3 w-3" /> Density</span>
                                        <span className="text-foreground">{template.fields?.length || 0} Inputs</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                        <span className="text-muted-foreground flex items-center gap-1.5"><Database className="h-3 w-3" /> Integrity</span>
                                        <span className="text-success flex items-center gap-1">
                                            <div className="h-1 w-1 rounded-full bg-success animate-pulse" /> CALIBRATED
                                        </span>
                                    </div>
                                    <div className="pt-2">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary group-hover:gap-2 transition-all">
                                            <span>Initialize Protocol</span>
                                            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center pt-8 opacity-40">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black italic">
                        All submissions are versioned and recorded via automated ledger tracking.
                    </p>
                </div>
            </div>
        </FeatureGuard>
    );
}
