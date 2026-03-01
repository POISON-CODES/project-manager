"use client";

import * as React from "react";
import {
    ChevronLeft,
    Search,
    Filter,
    ArrowUpDown,
    Eye,
    CheckCircle2,
    XCircle,
    Copy,
    ExternalLink,
    MoreHorizontal,
    FileSpreadsheet,
    MessageSquare,
    Loader2,
    ShieldCheck,
    Globe,
    FileText,
    Clock
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useParams, useRouter } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import { formService } from "@/services/form.service";

export default function FormSubmissionsPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params as { id: string };

    const [submissions, setSubmissions] = React.useState<any[]>([]);
    const [template, setTemplate] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [subs, temp] = await Promise.all([
                    formService.getSubmissions(id),
                    formService.getForm(id)
                ]);
                setSubmissions(subs);
                setTemplate(temp);
            } catch (err) {
                console.error("Failed to fetch submissions:", err);
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    const navigateToDetail = (projectId: string) => {
        router.push(`/admin/forms/${id}/submissions/${projectId}`);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background/50 backdrop-blur-md">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Scanning Transmission History...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        Transmission Log
                    </h1>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                        Protocol: <span className="text-primary italic">{template?.name || "Standard Intake"}</span>
                        <span className="opacity-30">•</span>
                        ID: <span className="font-mono text-foreground">{id}</span>
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm" className="font-black text-[9px] uppercase tracking-widest gap-2 border-border shadow-sm">
                        <FileSpreadsheet className="h-4 w-4" /> Export Protocol Data
                    </Button>
                </div>
            </div>

            {/* Submissions Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-surface/30 border-border p-4 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-1">Total Entries</p>
                    <p className="text-2xl font-black tracking-tighter italic">{submissions.length}</p>
                </Card>
                <Card className="bg-surface/30 border-border p-4 rounded-2xl relative overflow-hidden group border-l-4 border-l-success">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-1">Active Projects</p>
                    <p className="text-2xl font-black tracking-tighter italic">{submissions.filter(s => s.status !== 'DONE').length}</p>
                </Card>
                <Card className="bg-surface/30 border-border p-4 rounded-2xl relative overflow-hidden group">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-1">Success Rate</p>
                    <p className="text-2xl font-black tracking-tighter italic">94%</p>
                </Card>
                <Card className="bg-surface/30 border-border p-4 rounded-2xl relative overflow-hidden group">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-1">Avg Lead Time</p>
                    <p className="text-2xl font-black tracking-tighter italic">1.2d</p>
                </Card>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground/50" />
                    <Input placeholder="Filter by submitter..." className="pl-10 h-11 bg-surface/40 border-border/50 rounded-2xl text-[11px] font-bold uppercase tracking-widest" />
                </div>
                <Button variant="outline" className="h-11 px-6 gap-2 border-border rounded-2xl text-[10px] font-black uppercase tracking-widest bg-surface/30">
                    <Filter className="h-4 w-4" /> Refine Log
                </Button>
            </div>

            <div className="rounded-[2rem] border border-border/50 bg-surface/20 backdrop-blur-xl overflow-hidden shadow-2xl">
                <div className="grid grid-cols-12 gap-4 p-6 border-b border-border/30 bg-muted/20 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <div className="col-span-4 pl-4">Submitter Identity</div>
                    <div className="col-span-3">System Status</div>
                    <div className="col-span-3">Sync Timestamp</div>
                    <div className="col-span-2 text-right pr-4">Control</div>
                </div>

                <div className="divide-y divide-border/20">
                    {submissions.length > 0 ? (
                        submissions.map((sub) => (
                            <div
                                key={sub.id}
                                className="grid grid-cols-12 gap-4 p-6 items-center hover:bg-primary/5 transition-all group cursor-pointer"
                                onClick={() => navigateToDetail(sub.id)}
                            >
                                <div className="col-span-4 flex items-center gap-4 pl-4">
                                    <Avatar className="h-9 w-9 border border-primary/20 shadow-md">
                                        <AvatarImage src={sub.owner?.avatarUrl} />
                                        <AvatarFallback className="text-[10px] font-black bg-primary/10 text-primary">{getInitials(sub.owner?.name || sub.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-black tracking-tighter leading-none group-hover:text-primary transition-colors">{sub.name}</p>
                                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest italic">{sub.owner?.name || "System Automated"}</p>
                                    </div>
                                </div>

                                <div className="col-span-3">
                                    <Badge
                                        className={cn(
                                            "capitalize font-black tracking-widest px-3 h-6 text-[9px] shadow-sm",
                                            sub.status === "DONE" && "bg-success/10 text-success border-success/30",
                                            sub.status === "HALTED" && "bg-destructive/10 text-destructive border-destructive/30",
                                            sub.status === "PLANNING" && "bg-amber-500/10 text-amber-500 border-amber-500/30",
                                            sub.status === "IN_PROGRESS" && "bg-primary/10 text-primary border-primary/30"
                                        )}
                                    >
                                        {sub.status}
                                    </Badge>
                                </div>

                                <div className="col-span-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                    {new Date(sub.createdAt).toLocaleDateString()} <span className="italic ml-1">v{new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>

                                <div className="col-span-2 flex items-center justify-end pr-4 gap-2">
                                    <Button size="sm" variant="ghost" className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-all rounded-xl border border-transparent hover:border-primary/20">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 p-0 hover:bg-primary/10">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-surface/70 backdrop-blur-md border border-border shadow-2xl">
                                            <DropdownMenuItem className="cursor-pointer gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-success" /> Approve Request
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer gap-2">
                                                <XCircle className="h-4 w-4 text-destructive" /> Reject Request
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer gap-2">
                                                <MessageSquare className="h-4 w-4" /> Add Comment
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer gap-2">
                                                <Copy className="h-4 w-4" /> Copy ID
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 text-center opacity-30 flex flex-col items-center justify-center">
                            <Clock className="h-10 w-10 mb-4 animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Log Transmission Empty</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest mt-1">Standby for incoming intake packets...</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] px-4">
                <span className="flex items-center gap-2 italic"><ShieldCheck className="h-3 w-3" /> Encrypted Audit Trail Active</span>
                <span className="flex items-center gap-2"><Globe className="h-3 w-3" /> Global Node Synchronization</span>
            </div>
        </div>
    );
}

import { ChevronRight } from "lucide-react";
