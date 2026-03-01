"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
    Clock,
    MessageSquare,
    Send,
    User as UserIcon,
    AlertCircle,
    CheckCircle2,
    Calendar
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getInitials } from "@/lib/utils";
import { SystemStatus, Priority } from "@/types";
import api from "@/lib/api";
import { format } from "date-fns";

interface Comment {
    id: string;
    content: string;
    author: {
        name: string;
        avatarUrl?: string;
    };
    createdAt: string;
}

interface TaskDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    task: {
        id: string;
        title: string;
        description?: string;
        status: SystemStatus;
        priority: Priority;
        dueDate?: string;
        estimatedMinutes?: number;
        bufferMinutes?: number;
        totalMinutes?: number;
        scheduledStart?: string;
        scheduledEnd?: string;
        assignee?: {
            name: string;
            avatarUrl?: string;
        };
    } | null;
}

export function TaskDetailDialog({ isOpen, onClose, task }: TaskDetailDialogProps) {
    const [newComment, setNewComment] = React.useState("");
    const [isLoadingComments, setIsLoadingComments] = React.useState(false);
    const [comments, setComments] = React.useState<Comment[]>([]);

    React.useEffect(() => {
        if (isOpen && task?.id) {
            const fetchComments = async () => {
                setIsLoadingComments(true);
                try {
                    const res = await api.get(`/tasks/${task.id}/comments`).catch(() => ({
                        data: {
                            success: true,
                            data: []
                        }
                    }));
                    const data = res.data?.data || [];
                    setComments(data);
                } catch (error) {
                    console.error("Failed to fetch comments:", error);
                } finally {
                    setIsLoadingComments(false);
                }
            };
            fetchComments();
        }
    }, [isOpen, task?.id]);

    if (!task) return null;

    const handleAddComment = async () => {
        if (!newComment.trim() || !task) return;

        try {
            const optimisticComment: Comment = {
                id: `temp-${Date.now()}`,
                content: newComment,
                author: { name: "You" },
                createdAt: new Date().toISOString()
            };
            setComments(prev => [...prev, optimisticComment]);
            setNewComment("");

            await api.post(`/tasks/${task.id}/comments`, { content: newComment });
            // Ideally re-fetch or replace optimistic comment with real one
        } catch (error) {
            console.error("Failed to add comment:", error);
            // Revert optimistic update on error
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-surface/95 backdrop-blur-xl border-border/50">
                <DialogHeader className="p-6 border-b border-border/30 bg-muted/20">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20">
                                    {task.status}
                                </Badge>
                                <Badge variant="outline" className={cn(
                                    "text-[10px] font-black uppercase tracking-widest",
                                    task.priority === "CRITICAL" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-muted text-muted-foreground"
                                )}>
                                    {task.priority} Priority
                                </Badge>
                            </div>
                            <DialogTitle className="text-xl font-black tracking-tight text-foreground/90">
                                {task.title}
                            </DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 flex overflow-hidden">
                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 border-r border-border/30">
                        <section className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Description</h4>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {task.description || "No description provided for this task."}
                            </p>
                        </section>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-background/50 border border-border/20 space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <UserIcon className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Assignee</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6 border border-border/50">
                                        <AvatarImage src={task.assignee?.avatarUrl} />
                                        <AvatarFallback className="text-[10px] bg-primary/10">{getInitials(task.assignee?.name)}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-bold">{task.assignee?.name || "Unassigned"}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-background/50 border border-border/20 space-y-2">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Time Estimates</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="opacity-60">Estimated:</span>
                                        <span className="font-bold">{task.estimatedMinutes || 0}m</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="opacity-60 text-primary/70">Buffer (15%):</span>
                                        <span className="font-bold text-primary/70">+{task.bufferMinutes || 0}m</span>
                                    </div>
                                    <div className="pt-1 border-t border-border/20 flex justify-between text-xs font-black">
                                        <span>Total:</span>
                                        <span>{task.totalMinutes || 0}m</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {task.scheduledStart && (
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
                                <div className="flex items-center gap-2 text-primary">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Scheduled Time</span>
                                </div>
                                <div className="text-sm font-bold flex items-center gap-4">
                                    <span>{new Date(task.scheduledStart).toLocaleDateString()}</span>
                                    <Badge variant="outline" className="font-mono text-[10px] border-primary/20 bg-primary/10">
                                        {format(new Date(task.scheduledStart), "HH:mm")} - {task.scheduledEnd ? format(new Date(task.scheduledEnd), "HH:mm") : "?"}
                                    </Badge>
                                </div>
                            </div>
                        )}

                        <section className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    Conversation
                                </h4>
                                <span className="text-[10px] font-bold text-primary/70">{comments.length} updates</span>
                            </div>

                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3 group">
                                        <Avatar className="h-7 w-7 border border-border/50 shrink-0">
                                            <AvatarImage src={comment.author.avatarUrl} />
                                            <AvatarFallback className="text-[10px] bg-muted">{getInitials(comment.author.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-black uppercase tracking-tighter text-foreground/80">{comment.author.name}</span>
                                                <span className="text-[9px] text-muted-foreground opacity-60">
                                                    {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="p-3 rounded-2xl rounded-tl-none bg-muted/30 border border-border/20 text-sm leading-relaxed text-muted-foreground/90">
                                                {comment.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Panel / Activity Bar */}
                    <div className="w-[200px] bg-muted/5 p-6 flex flex-col gap-6">
                        <div className="space-y-3">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Quick Actions</h4>
                            <div className="space-y-1">
                                <Button variant="ghost" className="w-full justify-start text-xs h-8 hover:bg-primary/5 hover:text-primary gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Complete
                                </Button>
                                <Button variant="ghost" className="w-full justify-start text-xs h-8 hover:bg-destructive/5 hover:text-destructive gap-2">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    Halt Task
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Input Area */}
                <div className="p-4 bg-surface border-t border-border/30">
                    <div className="relative group">
                        <Textarea
                            placeholder="Share an update or mention someone..."
                            className="min-h-[80px] bg-background/50 border-border/50 focus:border-primary/50 transition-all resize-none rounded-2xl p-4 pr-14 text-sm scrollbar-hide"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment();
                                }
                            }}
                        />
                        <Button
                            className="absolute bottom-3 right-3 h-10 w-10 rounded-xl p-0 shadow-lg shadow-primary/20 transition-transform active:scale-95"
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="mt-2 text-center text-[9px] text-muted-foreground/40 font-bold uppercase tracking-wider">
                        Press Enter to send message
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
