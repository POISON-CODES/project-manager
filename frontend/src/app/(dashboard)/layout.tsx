"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { DashboardHeader } from "@/components/shared/header";
import { Loader2, Workflow } from "lucide-react";
import { authService } from "@/services/auth.service";

/**
 * Root Dashboard Layout.
 * Provides the SidebarProvider context and structure for all dashboard sub-pages.
 * 
 * @param children - The page content.
 */

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const session = await authService.getSession();
                if (!session) {
                    router.push("/login");
                } else {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Workflow className="h-10 w-10 animate-pulse text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
                        Authenticating...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background flex flex-col h-screen overflow-hidden">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative bg-muted/5">
                    <div className="max-w-[1600px] mx-auto w-full h-full flex flex-col">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
