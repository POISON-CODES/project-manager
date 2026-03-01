"use client";

import * as React from "react";
import {
    LayoutDashboard,
    Calendar,
    FolderKanban,
    CheckSquare,
    Workflow,
    ShieldCheck,
    Search,
    Zap,
    Info,
    FilePlus
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useFeatureStore } from "@/store/feature-store";
import { AppFeature } from "@/types";

const iconMap = {
    LayoutDashboard,
    Calendar,
    FolderKanban,
    CheckSquare,
    Workflow,
    ShieldCheck,
    Search,
    FilePlus
};

export function FeaturesManagement() {
    const { features, toggleFeature } = useFeatureStore();

    const getIcon = (iconName?: string) => {
        if (!iconName) return <Zap className="h-5 w-5" />;
        const Icon = (iconMap as any)[iconName] || Zap;
        return <Icon className="h-5 w-5" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Feature Matrix
                    </h2>
                    <p className="text-muted-foreground text-sm italic font-medium">Toggle core application modules to streamline your ecosystem experience.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature) => (
                    <Card key={feature.id} className="bg-surface/40 border-border/50 hover:border-primary/30 transition-all group overflow-hidden relative">
                        {!feature.enabled && (
                            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10" />
                        )}
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-20">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl border ${feature.enabled ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted/20 border-border/50 text-muted-foreground'}`}>
                                    {getIcon(feature.icon)}
                                </div>
                                <div className="space-y-0.5">
                                    <CardTitle className="text-sm font-black uppercase tracking-tight italic">
                                        {feature.name}
                                    </CardTitle>
                                    <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest h-4 ${feature.enabled ? 'bg-primary/5 text-primary border-primary/10' : 'bg-muted/10 text-muted-foreground border-border/50'}`}>
                                        {feature.id.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                            <Switch
                                checked={feature.enabled}
                                onCheckedChange={() => toggleFeature(feature.id)}
                                className="relative z-30"
                                disabled={feature.id === "ADMIN_CONTROLS"}
                            />
                        </CardHeader>
                        <CardContent className="relative z-20">
                            <CardDescription className="text-xs italic font-medium leading-relaxed">
                                {feature.description}
                            </CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-primary/5 border-dashed border-primary/20">
                <CardContent className="p-4 flex items-start gap-4">
                    <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">System Notice</p>
                        <p className="text-xs italic text-muted-foreground font-medium">Disabling features will remove them from the navigation nexus and suspend related automated routines. Changes are applied instantly to all active sessions.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
