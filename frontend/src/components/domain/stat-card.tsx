"use client";

import { LucideIcon, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string;
    description?: string;
    icon: LucideIcon;
    color?: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    tooltip?: string;
    children?: React.ReactNode;
}

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    color = "text-primary",
    trend,
    tooltip,
    children,
}: StatCardProps) {
    return (
        <Card className="bg-surface border-border hover:border-primary/50 transition-all group overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-1">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    {tooltip && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="h-3 w-3 opacity-40 hover:opacity-100 transition-opacity">
                                        <Info className="h-3 w-3" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-foreground text-background font-bold text-[10px] uppercase">
                                    {tooltip}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
                <Icon className={cn("h-4 w-4", color)} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <p className={cn(
                        "text-xs mt-1 font-medium",
                        trend.isPositive ? "text-success" : "text-destructive"
                    )}>
                        {trend.value}
                    </p>
                )}
                {description && !trend && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
                {children && <div className="mt-3">{children}</div>}
            </CardContent>
        </Card>
    );
}
