"use client";

import * as React from "react";
import {
    Users,
    Layout,
    Zap,
    Loader2,
    ShieldCheck
} from "lucide-react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/services/auth.service";
import { User } from "@/types";
import { toast } from "sonner";

import { UsersManagement } from "../settings/components/users-management";
import { FormsManagement } from "../settings/components/forms-management";
import { FeaturesManagement } from "../settings/components/features-management";
import { FeatureGuard } from "@/components/shared/feature-guard";

export default function AdminControlsPage() {
    const [user, setUser] = React.useState<User | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState("users");

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const session = await authService.getSession();
                if (session) {
                    setUser(session);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
                toast.error("Failed to load user session");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const isAdminOrLead = user?.role === "ADMIN" || user?.role === "PROJECT_LEAD";

    if (!isAdminOrLead) {
        return (
            <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
                <ShieldCheck className="h-12 w-12 text-muted-foreground opacity-20" />
                <h2 className="text-xl font-black italic uppercase tracking-widest">Access Denied</h2>
                <p className="text-muted-foreground text-sm italic">You do not have administrative privileges to access this area.</p>
            </div>
        );
    }

    return (
        <FeatureGuard feature="ADMIN_CONTROLS">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent italic uppercase">Admin Controls</h1>
                        <p className="text-muted-foreground italic font-medium">Fine-tune system parameters, manage project lifecycle, and oversee team dynamics.</p>
                    </div>
                    {user?.role === "ADMIN" && (
                        <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1 font-black italic tracking-widest text-[10px]">SYSTEM ADMINISTRATOR</Badge>
                    )}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-surface/50 backdrop-blur-md border border-border/50 p-1 gap-1 h-12 overflow-x-auto overflow-y-hidden custom-scrollbar max-w-full inline-flex">
                        <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-black text-[10px] uppercase tracking-[0.15em] px-4">
                            <Users className="h-3.5 w-3.5 text-indigo-500" /> Users & Stats
                        </TabsTrigger>
                        <TabsTrigger value="forms" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-black text-[10px] uppercase tracking-[0.15em] px-4">
                            <Layout className="h-3.5 w-3.5 text-emerald-500" /> Intake Forms
                        </TabsTrigger>
                        <TabsTrigger value="features" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-black text-[10px] uppercase tracking-[0.15em] px-4">
                            <Zap className="h-3.5 w-3.5 text-yellow-500" /> Core Features
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="space-y-6">
                        <UsersManagement currentUser={user} />
                    </TabsContent>

                    <TabsContent value="forms" className="space-y-6">
                        <FeatureGuard feature="INTAKE">
                            <FormsManagement />
                        </FeatureGuard>
                    </TabsContent>

                    <TabsContent value="features" className="space-y-6">
                        <FeaturesManagement />
                    </TabsContent>
                </Tabs>
            </div>
        </FeatureGuard>
    );
}
