"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Copy,
    CheckCircle2,
    Eye,
    Edit3,
    ExternalLink,
    FileText,
    Shield,
    Globe,
    Clock,
    Share2,
    Loader2,
    ChevronDown
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formService } from "@/services/form.service";
import { FormTemplate } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function FormPreviewPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params as { id: string };

    const [form, setForm] = React.useState<FormTemplate | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchForm = async () => {
            try {
                setIsLoading(true);
                const data = await formService.getForm(id);
                setForm(data);
            } catch (err) {
                toast.error("Failed to load form template");
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchForm();
    }, [id]);

    const copyShareUrl = () => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
        const shareUrl = `${baseUrl}/intake/${id}`;
        navigator.clipboard.writeText(shareUrl);
        toast.success("Shareable URL copied to clipboard");
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background/50 backdrop-blur-md">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Rendering Protocol Preview...</p>
                </div>
            </div>
        );
    }

    if (!form) return null;

    return (
        <div className="flex flex-col h-full bg-background border border-border/50 rounded-3xl animate-in fade-in duration-500 overflow-hidden shadow-2xl shadow-primary/5">
            {/* Header */}
            <div className="flex-none p-6 border-b border-border/50 bg-surface/30 backdrop-blur-md">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            className="p-2 rounded-xl bg-muted/10 hover:bg-primary/10 transition-colors cursor-pointer border border-border/50 shadow-sm group"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                                    {form.title}
                                </h1>
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold tracking-widest px-2">V{form.version}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Globe className="h-3 w-3" /> Public Protocol</span>
                                <Separator orientation="vertical" className="h-3 opacity-30" />
                                <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Updated 2 days ago</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="font-black text-[10px] uppercase tracking-widest gap-2 bg-background/50"
                            onClick={copyShareUrl}
                        >
                            <Copy className="h-3.5 w-3.5" /> Copy Share Link
                        </Button>
                        <Button
                            size="sm"
                            className="font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
                            onClick={() => router.push(`/admin/forms/${id}/edit`)}
                        >
                            <Edit3 className="h-3.5 w-3.5" /> Edit Form
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Live Preview Card */}
                    <Card className="border-border/50 shadow-2xl bg-surface/40 backdrop-blur-xl rounded-[2rem] overflow-hidden border-t-primary/20">
                        <CardHeader className="p-10 pb-6 border-b border-border/30 bg-gradient-to-br from-primary/5 to-transparent">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-2xl bg-primary shadow-lg shadow-primary/30">
                                    <FileText className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <div className="space-y-0.5">
                                    <h2 className="text-xl font-black tracking-tight uppercase italic">{form.title}</h2>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Protocol Submission Terminal</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground italic leading-relaxed">{form.description}</p>
                        </CardHeader>

                        <CardContent className="p-10 space-y-10">
                            {/* Render Fields based on schema if exists, otherwise fields array */}
                            {form.schema && (form.schema as any).sections && (form.schema as any).sections.length > 0 ? (
                                <div className="space-y-12">
                                    {(form.schema as any).sections.map((section: any, sIdx: number) => (
                                        <div key={sIdx} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${sIdx * 100}ms` }}>
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary italic whitespace-nowrap">{section.title}</h3>
                                                <div className="h-[1px] w-full bg-gradient-to-r from-primary/20 to-transparent" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {section.fields?.map((field: any, fIdx: number) => (
                                                    <div key={fIdx} className="space-y-2.5 group">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                                                            {field.label}
                                                            {field.required && <Badge className="bg-destructive/10 text-destructive text-[8px] border-none font-black h-4 px-1.5 uppercase">Required</Badge>}
                                                        </label>
                                                        <div className="h-12 w-full rounded-2xl bg-muted/20 border border-border/50 flex items-center px-4 transition-all group-hover:border-primary/30 group-hover:bg-muted/30">
                                                            <span className="text-[11px] text-muted-foreground italic uppercase tracking-wider">{field.placeholder || `Enter ${field.label}...`}</span>
                                                        </div>
                                                        {field.helpText && (
                                                            <p className="text-[9px] text-muted-foreground/60 font-medium italic pl-1">{field.helpText}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {form.fields.map((field, idx) => (
                                        <div key={field.id} className={cn("space-y-2.5 group animate-in slide-in-from-bottom-4 duration-500 fill-mode-both", field.type === 'textarea' && "md:col-span-2")} style={{ animationDelay: `${idx * 50}ms` }}>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                                                <span>{field.label} {field.required && <span className="text-destructive">*</span>}</span>
                                                {field.type === 'checkbox' && <Badge variant="outline" className="text-[7px] font-black uppercase px-1 h-3.5 border-primary/20 text-primary/60 tracking-widest">Binary</Badge>}
                                            </label>

                                            {field.type === 'textarea' ? (
                                                <div className="min-h-[100px] w-full rounded-2xl bg-muted/20 border border-border/50 p-4">
                                                    <span className="text-[11px] text-muted-foreground italic uppercase tracking-wider">{field.placeholder || `Enter ${field.label}...`}</span>
                                                </div>
                                            ) : field.type === 'checkbox' ? (
                                                <div className="h-12 w-full flex items-center gap-3">
                                                    <div className="h-5 w-5 rounded-lg border-2 border-primary/30 bg-primary/5 shadow-inner" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">{field.placeholder || "Apply Selection"}</span>
                                                </div>
                                            ) : (
                                                <div className="h-12 w-full rounded-2xl bg-muted/20 border border-border/50 flex items-center px-4 justify-between group-hover:border-primary/30 transition-all">
                                                    <span className="text-[11px] text-muted-foreground italic uppercase tracking-wider">{field.placeholder || `Enter ${field.label}...`}</span>
                                                    {(field.type === 'select' || field.type === 'multiselect') && (
                                                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50" />
                                                    )}
                                                </div>
                                            )}
                                            {field.helpText && (
                                                <p className="text-[9px] text-muted-foreground/60 font-medium italic pl-1">{field.helpText}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-6">
                                <Button className="w-full h-14 rounded-3xl font-black uppercase tracking-[0.2em] italic text-xs shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-primary/80 group overflow-hidden relative" disabled>
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Share2 className="h-4 w-4" /> Finalize Submission Protocol
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-between px-6 opacity-40">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Encrypted Submission Protocol v4.2</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest underline cursor-pointer">Security Compliance</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest underline cursor-pointer">Report Protocol Issue</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
