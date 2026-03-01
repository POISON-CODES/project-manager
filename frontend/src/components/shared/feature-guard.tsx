"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Home, ZapOff, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFeatureStore } from "@/store/feature-store";
import { AppFeature } from "@/types";

interface FeatureGuardProps {
    feature: AppFeature;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * FeatureGuard Component.
 * Protects specialized functional domains by verifying systemic activation states.
 * If a feature is decommissioned via the Admin Panel, this guard intercepts access
 * and presents a high-fidelity "Module Deactivated" state.
 */
export function FeatureGuard({ feature, children, fallback }: FeatureGuardProps) {
    const isEnabled = useFeatureStore(state => state.isFeatureEnabled(feature));
    const router = useRouter();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // Mounting...
    }

    if (!isEnabled) {
        if (fallback) return <>{fallback}</>;

        return (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
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
                        The <span className="text-primary font-bold">[{feature.replace('_', ' ')}]</span> domain has been decommissioned by system administrators. Access to this functional quadrant is currently restricted.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 font-black text-[10px] uppercase tracking-widest italic"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-3.5 w-3.5" /> Return Base
                    </Button>
                    {feature === "INTAKE" ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 font-black text-[10px] uppercase tracking-widest italic border-primary/20 hover:bg-primary/5 text-primary shadow-lg shadow-primary/5"
                            onClick={() => router.push('/generic-project-intake')}
                        >
                            <ClipboardCheck className="h-3.5 w-3.5" /> Generic Intake Protocol
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 font-black text-[10px] uppercase tracking-widest italic border-primary/20 hover:bg-primary/5 text-primary"
                            onClick={() => router.push('/dashboard')}
                        >
                            <Home className="h-3.5 w-3.5" /> Operations Center
                        </Button>
                    )}
                </div>

                <div className="pt-12">
                    <div className="bg-surface/30 border border-border/50 px-4 py-2 rounded-full flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                            Protocol 403: Functional Lockdown Active
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
