"use client";

import * as React from "react";
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Settings,
    ChevronRight,
    FileText,
    Workflow,
    ShieldCheck,
    Calendar as CalendarIcon,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarGroup,
    SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn, getInitials } from "@/lib/utils";

/**
 * Navigation items for the sidebar.
 * Structured to include sub-items for nested navigation.
 */
const navItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        isActive: true,
    },
    {
        title: "Calendar",
        url: "/calendar",
        icon: CalendarIcon,
    },
    {
        title: "Projects",
        url: "/projects",
        icon: FolderKanban,
        items: [
            { title: "All Projects", url: "/projects" },
            { title: "Active Projects", url: "/projects/active" },
            { title: "Completed Projects", url: "/projects/completed" },
            { title: "Global Queue", url: "/projects/queue" },
            { title: "Generic Intake", url: "/generic-project-intake" },
        ],
    },
    {
        title: "Tasks",
        url: "/tasks",
        icon: CheckSquare,
        items: [
            { title: "Board", url: "/tasks/board" },
            { title: "My Tasks", url: "/tasks/mine" },
            { title: "Active Tasks", url: "/tasks/active" },
        ],
    },
    {
        title: "Automation",
        url: "/workflows",
        icon: Workflow,
        items: [
            { title: "Workflows", url: "/workflows" },
            { title: "Triggers", url: "/automation/triggers" },
        ],
    },
];

const adminItems = [
    {
        title: "Admin Controls",
        url: "/admin/controls",
        icon: ShieldCheck,
    },
    {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
    },
];

import Link from "next/link";

/**
 * AppSidebar Component.
 * The primary navigation component for the application.
 * 
 * @returns A styled Sidebar component with navigation groups.
 */
import { useFeatureStore } from "@/store/feature-store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [user, setUser] = React.useState<any>(null);
    const { isFeatureEnabled } = useFeatureStore();

    React.useEffect(() => {
        import("@/services/auth.service").then(m => {
            m.authService.getSession().then(setUser);
        });
    }, []);

    const filteredNavItems = navItems.filter(item => {
        if (item.title === "Dashboard" && !isFeatureEnabled("DASHBOARD")) return false;
        if (item.title === "Calendar" && !isFeatureEnabled("CALENDAR")) return false;
        if (item.title === "Projects" && !isFeatureEnabled("PROJECTS")) return false;
        if (item.title === "Tasks" && !isFeatureEnabled("TASKS")) return false;
        if (item.title === "Automation" && !isFeatureEnabled("AUTOMATION")) return false;
        return true;
    });

    const filteredAdminItems = adminItems.filter(item => {
        if (item.title === "Admin Controls" && !isFeatureEnabled("ADMIN_CONTROLS")) return false;
        return true;
    });

    return (
        <Sidebar collapsible="icon" className="border-r border-border bg-surface" {...props}>
            <SidebarHeader className="h-16 flex items-center justify-center p-0 border-b border-border transition-all duration-300">
                <div className="flex items-center gap-2 font-bold text-primary">
                    <Workflow className="h-6 w-6 flex-shrink-0" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">NexusFlow</span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                        Main
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {filteredNavItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                {item.items ? (
                                    <div className="space-y-1">
                                        <SidebarMenuButton tooltip={item.title} className="hover:bg-accent/50 group/item">
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span className="font-bold">{item.title}</span>
                                        </SidebarMenuButton>
                                        <SidebarMenuSub className="border-l border-border/50 ml-4 py-1">
                                            {item.items.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton asChild className="hover:text-primary h-8">
                                                        <Link href={subItem.url} className="text-xs transition-colors">
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </div>
                                ) : (
                                    <SidebarMenuButton asChild tooltip={item.title} className="hover:bg-accent/50">
                                        <Link href={item.url}>
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span className="font-bold">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>

                {user?.role === "ADMIN" && (
                    <SidebarGroup className="mt-auto">
                        <SidebarGroupLabel className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                            Administration
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {filteredAdminItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title} className="hover:bg-accent/50">
                                        <Link href={item.url}>
                                            {item.icon && <item.icon className="h-4 w-4" />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t border-border p-2">
                <Link
                    href="/profile"
                    className="flex w-full items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors group/user"
                >
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold italic uppercase flex-shrink-0 shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                        {getInitials(user?.name)}
                    </div>
                    <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
                        <span className="text-xs font-bold leading-tight truncate group-hover/user:text-primary transition-colors">
                            {user?.name || "User"}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                            {user?.role?.replace('_', ' ') || "MEMBER"}
                        </span>
                    </div>
                </Link>
            </SidebarFooter>
        </Sidebar>
    );
}
