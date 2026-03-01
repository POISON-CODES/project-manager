"use client";

import { useEffect, useState } from "react";
import { User, Activity } from "@/types";
import { api } from "@/lib/api";
import { authService } from "@/services/auth.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    User as UserIcon,
    Mail,
    Shield,
    LogOut,
    Save,
    Clock,
    Activity as ActivityIcon,
    Camera,
    Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn, getInitials } from "@/lib/utils";

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        avatarUrl: "",
        phoneNumber: "",
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Get user session
                const sessionUser = await authService.getSession();
                if (sessionUser) {
                    setUser(sessionUser);
                    setFormData({
                        name: sessionUser.name,
                        avatarUrl: sessionUser.avatarUrl || "",
                        phoneNumber: sessionUser.phoneNumber || "",
                    });

                    // 2. Load recent user activity
                    const response = await api.get(`/users/activity?userId=${sessionUser.id}`);
                    if (response.data.success) {
                        setActivities(response.data.data.slice(0, 5));
                    }
                }
            } catch (error) {
                console.error("Failed to load profile data:", error);
                toast.error("Failed to load profile details.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        try {
            const response = await api.patch("/users/me/profile", formData);
            if (response.data.success) {
                const updatedUser = { ...user, ...formData };
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
                toast.success("Profile updated successfully!");
                // Force a refresh of the sidebar user info if needed, 
                // but since both use getSession/localStorage it might need a reload or shared state.
                // For now, let's just update the local state.
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast.error("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const isDirty = user && (
        formData.name !== user.name ||
        formData.avatarUrl !== (user.avatarUrl || "") ||
        formData.phoneNumber !== (user.phoneNumber || "")
    );

    const handleLogout = () => {
        authService.logout();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse font-medium">Loading your profile...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="h-[calc(100vh-6.5rem)] flex flex-col gap-4 overflow-hidden">
            {/* Header / Hero Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start shrink-0">
                <div className="relative group flex-shrink-0">
                    <div className="h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-background shadow-2xl bg-primary flex items-center justify-center overflow-hidden">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-2xl md:text-3xl font-black text-primary-foreground uppercase italic leading-none">
                                {getInitials(user.name)}
                            </span>
                        )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Camera className="text-white h-8 w-8" />
                    </div>
                </div>

                <div className="flex-1 space-y-2 pt-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic text-foreground">
                            {user.name}
                        </h1>
                        <Badge variant="outline" className="border-primary/50 text-primary font-bold px-3">
                            <Shield className="h-3 w-3 mr-1" />
                            {user.role}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {user.email}
                    </p>
                    <div className="flex gap-4 pt-4">
                        <div className="bg-accent/50 p-3 rounded-lg border border-border/50 backdrop-blur-sm">
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Status</p>
                            <p className="text-sm font-bold text-green-500 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                Active
                            </p>
                        </div>
                        <div className="bg-accent/50 p-3 rounded-lg border border-border/50 backdrop-blur-sm">
                            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Identity</p>
                            <p className="text-sm font-bold text-foreground">
                                USER-{(user.id.slice(0, 8)).toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex-shrink-0">
                    <Button variant="destructive" onClick={handleLogout} className="font-bold flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        Logout Session
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
                {/* Edit Profile Form */}
                <div className="lg:col-span-2 flex flex-col min-h-0">
                    <Card className="border-border/40 shadow-xl bg-surface/50 backdrop-blur-md h-full flex flex-col">
                        <CardHeader className="p-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-black uppercase italic">
                                <UserIcon className="h-4 w-4 text-primary" />
                                General Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="name" className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Your full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-background/40 border-border/30 focus:border-primary transition-all font-medium py-4 text-sm"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="phoneNumber" className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Phone Number</Label>
                                    <Input
                                        id="phoneNumber"
                                        placeholder="+1 234 567 8900"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className="bg-background/40 border-border/30 focus:border-primary transition-all font-medium py-4 text-sm"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="avatarUrl" className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Avatar URL</Label>
                                    <Input
                                        id="avatarUrl"
                                        placeholder="https://images.remote.com/photo.jpg"
                                        value={formData.avatarUrl}
                                        onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                        className="bg-background/40 border-border/30 focus:border-primary transition-all font-medium py-4 text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="space-y-1 opacity-50">
                                        <Label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Email</Label>
                                        <Input value={user.email} disabled className="bg-muted/30 border-border/20 py-4 text-xs" />
                                    </div>
                                    <div className="space-y-1 opacity-50">
                                        <Label className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Role</Label>
                                        <Input value={user.role} disabled className="bg-muted/30 border-border/20 py-4 text-xs" />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSaving || !isDirty}
                                    className={cn(
                                        "w-full text-primary-foreground font-black uppercase italic tracking-widest h-10 shadow-lg transition-all active:scale-[0.98]",
                                        isDirty ? "bg-primary hover:bg-primary/90 shadow-primary/20" : "bg-muted/50 opacity-40 cursor-not-allowed"
                                    )}
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Update Profile
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div className="flex flex-col min-h-0 space-y-4">
                    <Card className="border-border/40 shadow-xl bg-surface/50 backdrop-blur-md flex-1 flex flex-col overflow-hidden">
                        <CardHeader className="p-4 shrink-0">
                            <CardTitle className="flex items-center gap-2 text-lg font-black uppercase italic">
                                <ActivityIcon className="h-4 w-4 text-primary" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
                            <div className="space-y-0">
                                {activities.length > 0 ? (
                                    activities.map((activity, idx) => (
                                        <div key={activity.id} className={`p-3 hover:bg-accent/30 transition-colors ${idx !== activities.length - 1 ? 'border-b border-border/30' : ''}`}>
                                            <div className="flex gap-3">
                                                <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <p className="text-[10px] font-bold leading-tight">
                                                        <span className="text-primary uppercase tracking-tighter mr-1">{activity.action.split('_')[0]}</span>
                                                        <span className="text-foreground">{activity.entityType.toLowerCase()}</span>
                                                    </p>
                                                    <p className="text-[9px] text-muted-foreground mt-0.5">
                                                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center bg-accent/20">
                                        <ActivityIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                                        <p className="text-[10px] text-muted-foreground font-medium italic">No recent activity.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-accent/10 p-3 border-t border-border/20 shrink-0">
                            <Button variant="ghost" className="w-full h-8 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10">
                                View History
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="border-primary/20 bg-primary/5 border-dashed overflow-hidden relative shrink-0">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Shield className="h-16 w-16 -mr-4 -mt-4 rotate-12" />
                        </div>
                        <CardHeader className="p-3 pb-1">
                            <CardTitle className="text-[9px] font-black uppercase text-primary tracking-widest">Security Tip</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
                                Secured by Supabase Auth (JWT). Ensure "Avatar URL" uses HTTPS.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
