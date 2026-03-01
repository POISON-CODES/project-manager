"use client";

import Link from "next/link";
import { Bell, Search, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";

import { useFeatureStore } from "@/store/feature-store";

/**
 * Dashboard Header Component.
 * contains Sidebar toggle, Breadcrumbs, Global Search, and Notifications.
 * 
 * @returns A styled header component.
 */
export function DashboardHeader() {
    const pathname = usePathname();
    const { labels } = useBreadcrumbStore();
    const { isFeatureEnabled } = useFeatureStore();

    const generateBreadcrumbs = () => {
        const segments = pathname.split('/').filter(Boolean);
        return segments.map((segment: string, index: number) => {
            const href = `/${segments.slice(0, index + 1).join('/')}`;

            // Check if there's a custom label for this segment (e.g. project name instead of ID)
            const label = labels[segment] || segment
                .replace(/-/g, ' ')
                .replace(/^\w/, (c) => c.toUpperCase());

            const isLast = index === segments.length - 1;

            return (
                <React.Fragment key={href}>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                        {isLast ? (
                            <BreadcrumbPage className="font-medium text-foreground capitalize truncate max-w-[150px]">{label}</BreadcrumbPage>
                        ) : (
                            <BreadcrumbLink asChild className="text-muted-foreground hover:text-primary transition-colors capitalize">
                                <Link href={href}>{label}</Link>
                            </BreadcrumbLink>
                        )}
                    </BreadcrumbItem>
                </React.Fragment>
            );
        });
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b border-border bg-background">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink asChild className="text-muted-foreground hover:text-primary transition-colors">
                                <Link href="/dashboard">NexusFlow</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {generateBreadcrumbs()}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-end max-w-xl">
                {isFeatureEnabled("GLOBAL_SEARCH") && (
                    <div className="relative w-full max-w-sm hidden sm:block">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search projects or tasks..."
                            className="pl-8 bg-surface border-border focus-visible:ring-primary"
                        />
                    </div>
                )}
                <button className="p-2 rounded-md hover:bg-accent transition-colors relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background"></span>
                </button>
                <Separator orientation="vertical" className="h-6 mx-2" />
                <button
                    onClick={() => {
                        import("@/services/auth.service").then(m => m.authService.logout());
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors font-bold text-xs uppercase tracking-wider"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden md:inline">Logout</span>
                </button>
            </div>
        </header>
    );
}
