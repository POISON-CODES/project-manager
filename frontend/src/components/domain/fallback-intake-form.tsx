"use client";

import * as React from "react";
import {
    Send,
    ClipboardCheck,
    AlertCircle,
    Calendar as CalendarIcon,
    Info,
    CheckCircle2,
    ZapOff,
    ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { projectService } from "@/services/project.service";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function FallbackIntakeForm() {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            priority: formData.get("priority") as string,
            targetDate: formData.get("targetDate") as string,
        };

        try {
            await projectService.createProject({
                name: data.name,
                description: data.description,
                formTemplateId: "FALLBACK_MANUAL",
                formData: {
                    ...data,
                    submittedAt: new Date().toISOString(),
                    source: "FALLBACK_FORM"
                }
            });

            toast.success("Project proposal submitted to Global Queues.");
            setIsSuccess(true);
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error("Failed to submit project proposal.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center border-2 border-success/20">
                    <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Transmission Received</h2>
                    <p className="text-muted-foreground max-w-md mx-auto text-sm italic font-medium">
                        Your project proposal has been successfully routed to the Global Queues.
                        The system architects will review and initialize the execution phase shortly.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setIsSuccess(false)}
                    className="font-black italic uppercase tracking-widest text-[10px] h-10 px-8"
                >
                    Submit Another Protocol
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Standard "Module Deactivated" Error State */}
            <div className="flex flex-col items-center justify-center space-y-8 pt-10">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <div className="relative bg-surface/50 backdrop-blur-xl border border-border/50 p-8 rounded-full shadow-2xl">
                        <ZapOff className="h-16 w-16 text-muted-foreground opacity-50" />
                        <ShieldAlert className="h-8 w-8 text-primary absolute -bottom-2 -right-2 animate-bounce" />
                    </div>
                </div>

                <div className="text-center space-y-3 max-w-md mx-auto">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
                        Module Deactivated
                    </h2>
                    <p className="text-muted-foreground text-sm italic font-medium leading-relaxed px-4">
                        The <span className="text-primary font-bold">[INTAKE SYSTEMS]</span> domain has been decommissioned.
                        Primary automated protocols are currently restricted.
                    </p>
                </div>

                <div className="bg-surface/30 border border-border/20 px-4 py-2 rounded-full flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                        Manual Triage Bypass Protocol Active
                    </span>
                </div>
            </div>

            {/* The Fallback Form Section */}
            <Card className="max-w-3xl mx-auto bg-surface/40 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden group border-l-4 border-l-primary/50 relative">
                <div className="absolute top-0 right-0 p-4">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black italic tracking-[0.2em] text-[9px] px-3 py-1 uppercase">Backup Mode</Badge>
                </div>
                <CardHeader className="space-y-4 pb-8">
                    <div className="space-y-1">
                        <CardTitle className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                            <ClipboardCheck className="h-8 w-8 text-primary" />
                            Manual Project Triage
                        </CardTitle>
                        <CardDescription className="text-sm italic font-medium max-w-xl">
                            Intake Infrastructure is offline. Use this manual protocol to register new initiatives directly into the global queue.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Strategic Project Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="E.G., Q3 INFRASTRUCTURE REVAMP"
                                    required
                                    className="bg-surface/50 border-border/30 h-12 font-bold focus-visible:ring-primary/30 text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priority" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Execution Priority</Label>
                                <Select name="priority" defaultValue="MEDIUM">
                                    <SelectTrigger className="h-12 bg-surface/50 border-border/30 font-bold focus-visible:ring-primary/30 text-xs">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-surface border-border">
                                        <SelectItem value="LOW" className="font-bold text-xs uppercase italic">Low Latency</SelectItem>
                                        <SelectItem value="MEDIUM" className="font-bold text-xs text-blue-500 uppercase italic">Standard Priority</SelectItem>
                                        <SelectItem value="HIGH" className="font-bold text-xs text-yellow-500 uppercase italic">High Velocity</SelectItem>
                                        <SelectItem value="CRITICAL" className="font-bold text-xs text-destructive uppercase italic">Mission Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mission Parameters & Scope</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Detail the objectives, required resources, and intended outcomes..."
                                required
                                className="bg-surface/50 border-border/30 min-h-[120px] font-medium leading-relaxed resize-none focus-visible:ring-primary/30 text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label htmlFor="targetDate" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Target Completion Matrix</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                                    <Input
                                        id="targetDate"
                                        name="targetDate"
                                        type="date"
                                        required
                                        className="pl-10 bg-surface/50 border-border/30 h-12 font-bold focus-visible:ring-primary/30 text-xs"
                                    />
                                </div>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 font-black italic uppercase tracking-widest gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <AlertCircle className="h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Initiate Project
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>

                    <div className="mt-12 pt-6 border-t border-border/30 flex items-center justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-widest italic">
                        <p>Secured via System-Level Bypass</p>
                        <p>Global Queue Root Access Granted</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
