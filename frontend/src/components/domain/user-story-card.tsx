"use client";

import { UserStory, Task } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { ExternalLink, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn, getInitials } from "@/lib/utils";

interface UserStoryCardProps {
    story: UserStory;
}

export function UserStoryCard({ story }: UserStoryCardProps) {
    const allTasks = story.tasks || [];
    const allAssignees = allTasks.flatMap(t => t.assignees || (t.assignee ? [t.assignee] : []));
    const uniqueAssignees = Array.from(new Map(allAssignees.map(u => [u.id, u])).values());

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="group/story border border-border/50 rounded-2xl bg-surface hover:bg-accent/5 transition-all cursor-pointer p-5 shadow-sm hover:shadow-md">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-base group-hover/story:text-primary transition-colors flex items-center gap-2 tracking-tight">
                                    {story.title}
                                    <ExternalLink className="h-3 w-3 opacity-0 group-hover/story:opacity-100 transition-opacity text-primary" />
                                </h3>
                                <StatusBadge status={story.status} isHalted={story.isHalted} />
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed">{story.description}</p>
                        </div>

                        {/* Summary */}
                        <div className="flex items-center justify-between md:justify-end gap-6 text-xs text-muted-foreground mt-3 md:mt-0">
                            {uniqueAssignees.length > 0 && (
                                <div className="flex -space-x-1.5 focus-within:z-10">
                                    {uniqueAssignees.slice(0, 3).map(user => (
                                        <Avatar key={user.id} className="h-7 w-7 border-2 border-background ring-1 ring-border shadow-sm">
                                            {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                                            <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-black uppercase">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                    {uniqueAssignees.length > 3 && (
                                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center border-2 border-background text-[9px] font-black ring-1 ring-border shadow-sm">
                                            +{uniqueAssignees.length - 3}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="font-black px-2.5 py-1 bg-muted/50 rounded-full text-[10px] uppercase tracking-wider text-muted-foreground/80">
                                    {allTasks.length} {allTasks.length === 1 ? 'Task' : 'Tasks'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className="min-w-[75vw] max-w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 bg-surface/95 backdrop-blur-xl border-border rounded-3xl shadow-2xl overflow-hidden">
                <DialogHeader className="p-8 pb-4 relative">
                    <div className="flex items-center gap-4 mb-3">
                        <StatusBadge status={story.status} isHalted={story.isHalted} className="h-6 px-3" />
                        <span className="text-[10px] text-muted-foreground/50 font-mono tracking-widest uppercase font-black">Ref: {story.id}</span>
                    </div>
                    <DialogTitle className="text-3xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {story.title}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-3 text-base leading-relaxed max-w-4xl">
                        {story.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-8 pt-2 scrollbar-hide">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
                            <div className="h-1 w-8 bg-primary/30 rounded-full" />
                            Work Breakdown Structure
                        </h4>
                        <Button size="sm" variant="outline" className="h-9 text-[10px] font-black uppercase tracking-widest gap-2 bg-surface/50 border-border/50 rounded-xl hover:bg-surface hover:text-primary transition-all shadow-sm">
                            <Plus className="h-3 w-3" /> New Task
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {allTasks.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-border/30 rounded-3xl bg-muted/5">
                                <p className="text-muted-foreground/50 text-sm font-medium">No tasks associated with this story.</p>
                                <Button variant="link" className="text-primary text-[11px] font-black uppercase tracking-widest mt-2 hover:no-underline">Begin breakdown</Button>
                            </div>
                        ) : (
                            allTasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-border/50 hover:border-primary/40 transition-all group/task shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("h-6 w-6 rounded-lg border flex items-center justify-center transition-all shadow-inner",
                                            task.status === "DONE" ? "bg-primary border-primary text-primary-foreground" : "border-border/50 bg-muted/20 text-muted-foreground/30"
                                        )}>
                                            {task.status === "DONE" && <CheckCircle2 className="h-4 w-4" />}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <span className={cn("text-sm font-bold tracking-tight transition-all",
                                                    task.status === "DONE" ? "text-muted-foreground/50 line-through" : "text-foreground"
                                                )}>
                                                    {task.title}
                                                </span>
                                                {task.priority && (
                                                    <div className={cn(
                                                        "h-1.5 w-1.5 rounded-full shadow-sm",
                                                        task.priority === "CRITICAL" ? "bg-destructive shadow-destructive/50" :
                                                            task.priority === "HIGH" ? "bg-orange-500 shadow-orange-500/50" :
                                                                task.priority === "MEDIUM" ? "bg-green-500 shadow-green-500/50" : "bg-blue-500 shadow-blue-500/50"
                                                    )} />
                                                )}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground/50 font-mono tracking-tighter uppercase">
                                                {task.updatedAt ? `Synced ${new Date(task.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Legacy Entry"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {(task.assignees && task.assignees.length > 0) || task.assignee ? (
                                            <div className="flex items-center -space-x-1.5 grayscale group-hover/task:grayscale-0 transition-all opacity-50 group-hover/task:opacity-100">
                                                {(task.assignees || [task.assignee]).map(user => user && (
                                                    <Avatar key={user.id} className="h-6 w-6 border border-background shadow-sm">
                                                        {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                                                        <AvatarFallback className="text-[8px] font-black uppercase">{user.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-[9px] text-muted-foreground/30 font-black uppercase tracking-widest italic px-2">Unassigned</span>
                                        )}
                                        <StatusBadge status={task.status} className="h-7 px-3 rounded-lg" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
