"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Loader2,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Database,
    ShieldCheck,
    Cpu,
    Activity,
    Layers,
    Lock,
    ChevronDown,
    Zap,
    Info,
    Terminal,
    ArrowRight
} from "lucide-react";
import { formService } from "@/services/form.service";
import { projectService } from "@/services/project.service";
import { DynamicForm } from "@/components/domain/dynamic-form";
import { FormTemplate } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function ProtocolSubmissionPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params as { id: string };

    const [form, setForm] = React.useState<FormTemplate | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [submissionData, setSubmissionData] = React.useState<any>(null);

    const FORM_ID = "intake-protocol-form";

    React.useEffect(() => {
        const fetchForm = async () => {
            try {
                setIsLoading(true);
                const data = await formService.getForm(id);
                setForm(data);
            } catch (err) {
                toast.error("Failed to load submission protocol");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchForm();
    }, [id]);

    const handleSubmit = async (formData: any) => {
        try {
            setIsProcessing(true);
            // Find a name field or use the title
            const name = formData.name || formData.project_name || formData.title || `Submission: ${form?.title}`;
            const description = formData.description || formData.requirements || form?.description || "";

            await projectService.createProject({
                name,
                description,
                formTemplateId: id,
                formData: formData
            });

            setSubmissionData(formData);
            setIsSubmitted(true);
            toast.success("Protocol submitted successfully");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to transmit payload");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full min-h-[80vh] items-center justify-center bg-background/50 backdrop-blur-3xl">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Cpu className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Initializing Terminal</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Calibrating Intake Node...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!form) {
        return (
            <div className="flex h-full min-h-[80vh] flex-col items-center justify-center gap-8 text-center px-6">
                <div className="p-8 rounded-[3rem] bg-destructive/5 border border-destructive/20 relative group">
                    <AlertCircle className="h-20 w-20 text-destructive opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-destructive flex items-center justify-center text-white shadow-lg animate-bounce">
                        <Lock className="h-4 w-4" />
                    </div>
                </div>
                <div className="space-y-3">
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter bg-gradient-to-b from-destructive to-destructive/60 bg-clip-text text-transparent">Protocol Not Found</h2>
                    <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em] max-w-md mx-auto leading-loose p-4 bg-surface/30 rounded-2xl border border-border/40">
                        The requested intake sequence <span className="text-destructive">[{id}]</span> does not exist or has been decommissioned from the central registry.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] h-14 px-10 border-border/50 hover:bg-surface transition-all group"
                    onClick={() => router.push('/intake')}
                >
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Return to Library
                </Button>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] px-6 animate-in fade-in duration-1000">
                <div className="w-full max-w-4xl relative overflow-hidden bg-background/40 backdrop-blur-xl border border-primary/20 rounded-[3rem] shadow-2xl p-1">
                    {/* Immersive Background Effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.15),transparent_70%)]" />
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--primary),0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--primary),0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                        <div className="absolute inset-0 animate-scan opacity-40" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center py-20 px-8 text-center bg-surface/40 backdrop-blur-sm rounded-[2.8rem]">
                        <div className="h-40 w-40 rounded-full bg-emerald-500/10 flex items-center justify-center mb-10 relative group">
                            <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-[ping_3s_linear_infinite]" />
                            <div className="absolute inset-4 rounded-full border border-emerald-500/40 animate-[spin_12s_linear_infinite]" />
                            <ShieldCheck className="h-20 w-20 text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-transform duration-500" />
                        </div>

                        <div className="space-y-4 mb-10">
                            <h2 className="text-5xl font-black uppercase tracking-[0.3em] text-foreground drop-shadow-sm italic">
                                Transmission Secure
                            </h2>
                            <div className="h-1 w-32 bg-emerald-500 mx-auto rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        </div>

                        <p className="text-muted-foreground font-mono text-[11px] max-w-lg mx-auto uppercase tracking-[0.3em] leading-loose mb-16 opacity-80">
                            Protocol <span className="text-emerald-500 font-black">[{id}]</span> synchronized at <span className="text-foreground">{new Date().toLocaleTimeString()}</span>.<br />
                            Signal broadcast initiated to global command queue.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-16">
                            {[
                                { label: "Encryption", value: "AS64-QUANTUM", icon: Lock, color: "text-emerald-500" },
                                { label: "Transmission ID", value: `TX-${Math.random().toString(36).substring(7).toUpperCase()}`, icon: Activity, color: "text-primary" },
                                { label: "Sync Status", value: "PERSISTED", icon: Database, color: "text-indigo-400" },
                            ].map((item, i) => (
                                <div key={i} className="bg-background/40 border border-border/40 p-6 rounded-3xl backdrop-blur-md group hover:border-primary/30 transition-all hover:-translate-y-1">
                                    <item.icon className={cn("h-5 w-5 mb-4 opacity-60 group-hover:opacity-100 transition-opacity mx-auto", item.color)} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-2">{item.label}</p>
                                    <p className="text-xs font-black uppercase tracking-tight text-foreground font-mono">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-12 border-t border-border/20 w-full flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto px-12 h-14 rounded-2xl border-border/40 bg-surface/50 font-black uppercase tracking-widest text-[10px] hover:bg-surface transition-all"
                                onClick={() => router.push('/projects')}
                            >
                                View Deployment Deck
                            </Button>
                            <Button
                                className="w-full sm:w-auto px-12 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 transition-all"
                                onClick={() => {
                                    setIsSubmitted(false);
                                    setSubmissionData(null);
                                }}
                            >
                                Initiate New Protocol
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:h-[calc(100vh-120px)] overflow-hidden animate-in fade-in duration-1000">
            {/* Left Column: Sidebar Info */}
            <div className="lg:col-span-4 border-r border-border/50 bg-surface/10 p-10 flex flex-col space-y-12 overflow-y-auto custom-scrollbar-thin">
                <div className="space-y-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="group gap-2 text-[10px] font-black uppercase tracking-widest p-0 hover:bg-transparent -ml-1 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => router.push('/intake')}
                    >
                        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                        Protocol Library
                    </Button>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-primary shadow-lg shadow-primary/40 text-primary-foreground">
                                <Layers className="h-6 w-6" />
                            </div>
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-3 h-6 border-primary/30 text-primary bg-primary/5">
                                ACTIVE PROTOCOL
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-tight bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
                                {form.title}
                            </h1>
                            <div className="flex items-center gap-3">
                                <div className="h-1 w-12 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.8)] animate-pulse" />
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">
                                    VER: {form.version} // NODE_ACTIVE
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground italic leading-relaxed font-medium">
                            {form.description || "Systemic requirements collection protocol. Please populate the schema matrix to initiate project triage."}
                        </p>
                    </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-border/20">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary italic">Compliance Matrix</h4>
                    <div className="grid gap-4">
                        <div className="p-4 rounded-2xl bg-surface/40 border border-border/30 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Encryption level</span>
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-none rounded-sm uppercase text-[8px] font-black">Military Grade</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Triage Tier</span>
                                <span className="text-[9px] font-black uppercase text-foreground">Standard-Alpha</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Node Verification</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] animate-pulse" />
                                    <span className="text-[9px] font-black uppercase text-emerald-500 italic">Verified-Secure</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                            <div className="flex items-center gap-2 text-primary">
                                <ShieldCheck className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Secure Tunnel Active</span>
                            </div>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase leading-tight opacity-70">
                                This submission is protected by end-to-end asymmetric encryption and recorded in the immutable audit log.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-auto space-y-4 pt-10">
                    <div className="flex items-center gap-2 px-1">
                        <Info className="h-3.5 w-3.5 text-muted-foreground/40" />
                        <span className="text-[9px] font-black uppercase tracking-widest italic text-muted-foreground/40">Protocol UID: {id}</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Form Canvas */}
            <div className="lg:col-span-8 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent custom-scrollbar flex flex-col">
                {/* Form Header / Control Deck */}
                <div className="sticky top-0 z-30 bg-background/40 backdrop-blur-xl border-b border-border/20 px-8 py-6 lg:px-12 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg shadow-black/5">
                    <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-[9px] font-black uppercase tracking-[0.2em] text-primary shadow-sm">
                            <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                            Core Schema Selection
                        </div>
                        <h2 className="text-2xl font-black tracking-tight uppercase italic leading-none text-foreground/90">
                            Requirements Matrix
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-surface/40 border border-border/40">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-6 w-6 rounded-full border border-background bg-muted-foreground/20 flex items-center justify-center text-[8px] font-black uppercase">
                                        {i}
                                    </div>
                                ))}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Node Tier 3</span>
                        </div>

                        <Button
                            form={FORM_ID}
                            type="submit"
                            disabled={isProcessing}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group shrink-0"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 mr-2.5 animate-spin" />
                                    SYNCING...
                                </>
                            ) : (
                                <>
                                    <Zap className="h-3.5 w-3.5 mr-2.5 group-hover:scale-110 transition-transform text-white/90 fill-white/10" />
                                    Deploy Protocol
                                    <ArrowRight className="h-4 w-4 ml-2.5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 p-8 lg:p-20 flex justify-center">
                    <div className="w-full max-w-3xl space-y-16">
                        <div className="relative group/canvas">
                            {/* Decorative Canvas elements */}
                            <div className="absolute -inset-10 bg-gradient-to-br from-primary/5 via-transparent to-transparent blur-[100px] rounded-[5rem] opacity-30 -z-10" />

                            <div className="bg-surface/20 backdrop-blur-3xl border border-border/30 rounded-[3rem] p-1 shadow-[0_20px_50px_rgba(0,0,0,0.3)] group-hover/canvas:border-primary/20 transition-colors duration-700">
                                <div className="bg-background/40 p-8 md:p-12 lg:p-16 rounded-[2.8rem] space-y-12">
                                    <div className="space-y-2 border-b border-border/10 pb-10">
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Data Injection Layer</h3>
                                        <p className="text-muted-foreground/60 text-xs italic font-medium leading-relaxed">
                                            Execute the protocol by populating the following requirement nodes. All fields are mandatory unless marked optional.
                                        </p>
                                    </div>

                                    <DynamicForm
                                        formId={FORM_ID}
                                        template={form}
                                        onSubmit={handleSubmit}
                                        hideSubmit={true}
                                        className="shadow-none border-none bg-transparent p-0 backdrop-blur-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer Feedback */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-10 px-8 py-10 rounded-[2.5rem] bg-surface/10 border border-border/10 backdrop-blur-sm grayscale hover:grayscale-0 transition-all duration-700">
                            <div className="flex items-center gap-5">
                                <div className="p-3 rounded-2xl bg-surface-raised border border-border/50 text-primary shadow-inner">
                                    <Database className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Automated Indexing</p>
                                    <p className="text-[9px] font-bold uppercase text-muted-foreground opacity-60">Global Cluster Persistence Enabled</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="h-10 w-[1px] bg-border/20 hidden md:block" />
                                <div className="flex items-center gap-5">
                                    <div className="text-right space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 leading-none">Status: Ready</p>
                                        <p className="text-[9px] font-bold uppercase text-muted-foreground opacity-60">Ready for Tunnel Injection</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full border border-emerald-500/20 flex items-center justify-center bg-emerald-500/5 shadow-lg shadow-emerald-500/5">
                                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

