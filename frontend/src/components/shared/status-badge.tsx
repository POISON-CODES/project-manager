"use client";

import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status?: string;
    isHalted?: boolean;
    className?: string;
}

export function StatusBadge({ status, isHalted, className }: StatusBadgeProps) {
    if (isHalted) {
        return (
            <Badge variant="destructive" className={cn("font-mono text-[10px] uppercase gap-1 animate-pulse border-destructive/50", className)}>
                <AlertCircle className="h-3 w-3" /> Halted
            </Badge>
        );
    }

    const styles: Record<string, string> = {
        TODO: "bg-muted/50 text-muted-foreground border-border hover:bg-muted/50",
        IN_PROGRESS: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10",
        DONE: "bg-success/10 text-success border-success/20 hover:bg-success/10",
        BACKLOG: "bg-muted/30 text-muted-foreground/70 border-border/50 hover:bg-muted/30",
        READY: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/10",
        ACTIVE: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/10",
        ARCHIVED: "bg-muted text-muted-foreground/50 border-border hover:bg-muted",
    };

    const displayStatus = status || "TODO";

    return (
        <Badge
            variant="outline"
            className={cn(
                "font-mono text-[10px] uppercase font-bold tracking-tight",
                styles[displayStatus.toUpperCase()] || styles.TODO,
                className
            )}
        >
            {displayStatus.replace("_", " ")}
        </Badge>
    );
}
