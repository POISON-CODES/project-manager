"use client";

import { cn } from "@/lib/utils";
import { Workflow } from "lucide-react";

/**
 * Auth Layout.
 * A clean, centered layout for authentication screens.
 * Uses the simplified modern gradient background.
 */
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col items-center text-center space-y-2">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4">
                        <Workflow className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        NexusFlow
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Enterprise Automation Engine
                    </p>
                </div>

                {children}

                <p className="text-center text-xs text-muted-foreground font-mono">
                    &copy; 2026 NexusFlow Inc. All rights reserved.
                </p>
            </div>
        </div>
    );
}
