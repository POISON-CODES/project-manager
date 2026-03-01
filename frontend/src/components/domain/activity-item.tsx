"use client";

import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Activity } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface ActivityItemProps {
    activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
    const initials = getInitials(activity.user?.name);

    return (
        <div className="flex items-start gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
            <Avatar className="h-8 w-8 border border-border">
                {activity.user?.avatarUrl && <AvatarImage src={activity.user.avatarUrl} alt={activity.user.name} />}
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                    {initials}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                    <span className="text-primary font-bold">{activity.user?.name || "System"}</span>{" "}
                    <span className="text-muted-foreground">{activity.action?.toLowerCase() || "performed an action"}</span>
                    {activity.entityName && (
                        <>
                            {" on "}
                            <span className="font-bold underline decoration-primary/30 underline-offset-4 cursor-pointer hover:decoration-primary transition-all">
                                {activity.entityName}
                            </span>
                        </>
                    )}
                </p>
                <div className="flex items-center pt-1 text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    <span className="text-[10px] font-mono uppercase tracking-tighter">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </span>
                </div>
            </div>
        </div>
    );
}
