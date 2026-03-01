"use client";

import * as React from "react";
import {
    User as UserIcon,
    Bell,
    Shield,
    Globe,
    Mail,
    Save,
    Camera,
    Moon,
    Monitor,
    Smartphone,
    Loader2
} from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { User } from "@/types";
import { toast } from "sonner";

export default function AdminSettingsPage() {
    const [user, setUser] = React.useState<User | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: "",
        email: "",
        avatarUrl: "",
    });

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const session = await authService.getSession();
                if (session) {
                    setUser(session);
                    setFormData({
                        name: session.name || "",
                        email: session.email || "",
                        avatarUrl: session.avatarUrl || "",
                    });
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
                toast.error("Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await userService.updateProfile({
                name: formData.name,
                avatarUrl: formData.avatarUrl,
            });
            toast.success("Profile updated successfully");
            setUser({ ...user, ...formData });
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent italic uppercase">User Settings</h1>
                    <p className="text-muted-foreground italic font-medium">Manage your personal profile, notification preferences, and security.</p>
                </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-surface/50 backdrop-blur-md border border-border/50 p-1 gap-1 h-12 overflow-x-auto overflow-y-hidden custom-scrollbar max-w-full inline-flex">
                    <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-black text-[10px] uppercase tracking-[0.15em] px-4">
                        <UserIcon className="h-3.5 w-3.5" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-black text-[10px] uppercase tracking-[0.15em] px-4">
                        <Bell className="h-3.5 w-3.5" /> Alerts
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-black text-[10px] uppercase tracking-[0.15em] px-4">
                        <Shield className="h-3.5 w-3.5" /> Security
                    </TabsTrigger>
                    <TabsTrigger value="workspace" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-black text-[10px] uppercase tracking-[0.15em] px-4">
                        <Globe className="h-3.5 w-3.5" /> Interface
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <Card className="bg-card border-border overflow-hidden shadow-xl shadow-primary/5">
                        <CardHeader className="border-b border-border/50 bg-accent/5 pb-6">
                            <CardTitle className="text-xl font-black italic">Personal Profile</CardTitle>
                            <CardDescription className="italic">How others see you in the workspace.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            <div className="flex items-center gap-8">
                                <div className="relative group">
                                    <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-black text-primary border-2 border-primary/20 group-hover:bg-primary/20 transition-all duration-300 overflow-hidden">
                                        {user?.avatarUrl ? (
                                            <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            getInitials(user?.name || user?.email || "?")
                                        )}
                                    </div>
                                    <button className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                        <Camera className="h-8 w-8 text-white" />
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black tracking-tighter">{user?.name}</h3>
                                    <p className="text-xs text-muted-foreground font-mono">{user?.email}</p>
                                    <div className="pt-2">
                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[10px] uppercase tracking-widest px-2">
                                            {user?.role}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full-name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                                    <Input
                                        id="full-name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="bg-background/50 border-border focus:ring-primary/20 h-11 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email-address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                                    <Input
                                        id="email-address"
                                        value={formData.email}
                                        disabled
                                        className="bg-muted/50 border-border h-11 italic opacity-70 font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="avatar-url" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Avatar URL</Label>
                                    <Input
                                        id="avatar-url"
                                        value={formData.avatarUrl}
                                        onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                        placeholder="https://example.com/avatar.png"
                                        className="bg-background/50 border-border focus:ring-primary/20 h-11 font-mono text-xs"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="timezone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Work Timezone</Label>
                                    <Select defaultValue="ist">
                                        <SelectTrigger id="timezone" className="bg-background/50 border-border h-11 font-bold">
                                            <SelectValue placeholder="Select timezone" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-surface/90 backdrop-blur-xl border border-border mt-1">
                                            <SelectItem value="utc" className="font-bold">UTC (Coordinated Universal Time)</SelectItem>
                                            <SelectItem value="ist" className="font-bold">IST (India Standard Time) - GMT+5:30</SelectItem>
                                            <SelectItem value="est" className="font-bold">EST (Eastern Standard Time)</SelectItem>
                                            <SelectItem value="pst" className="font-bold">PST (Pacific Standard Time)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-accent/5 border-t border-border/50 px-6 py-4 flex justify-end gap-3">
                            <Button className="gap-2 font-black h-11 px-8 shadow-lg shadow-primary/20 transition-all uppercase text-xs tracking-widest" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Update Profile Identity
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                    <Card className="bg-card border-border overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-accent/5 pb-6">
                            <CardTitle className="font-black italic">Communication Channels</CardTitle>
                            <CardDescription className="italic">Manage how the system reaches you.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            <div className="space-y-6">
                                <div className="grid gap-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-accent/5 border border-border/50 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-black italic">Pulse Summary</Label>
                                                <p className="text-[10px] text-muted-foreground font-medium">Daily email digest of all projects and tasks.</p>
                                            </div>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-accent/5 border border-border/50 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                                                <Smartphone className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-black italic">Mobile Push Alerts</Label>
                                                <p className="text-[10px] text-muted-foreground font-medium">Instant alerts for mentions and assignments.</p>
                                            </div>
                                        </div>
                                        <Switch />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="workspace" className="space-y-6">
                    <Card className="bg-card border-border overflow-hidden shadow-xl shadow-primary/5">
                        <CardHeader className="border-b border-border/50 bg-accent/5 pb-6">
                            <CardTitle className="font-black italic">Interface Aesthetics</CardTitle>
                            <CardDescription className="italic">Tailor the visual experience to your style.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Visual Mode</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                    <Card className="p-5 border-2 border-primary bg-primary/5 flex flex-col items-center gap-3 cursor-pointer shadow-lg shadow-primary/10">
                                        <Moon className="h-6 w-6 text-primary" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">NEXUS DARK</span>
                                    </Card>
                                    <Card className="p-5 border border-border bg-background flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 transition-all opacity-50 grayscale hover:grayscale-0">
                                        <Globe className="h-6 w-6 text-muted-foreground" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">PURE LIGHT</span>
                                    </Card>
                                    <Card className="p-5 border border-border bg-background flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 transition-all opacity-50 grayscale hover:grayscale-0">
                                        <Monitor className="h-6 w-6 text-muted-foreground" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">SYSTEM SYNC</span>
                                    </Card>
                                </div>
                            </div>

                            <div className="h-px bg-border/50" />

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-black italic">Glassmorphism Rendering</Label>
                                        <p className="text-[10px] text-muted-foreground font-medium">Use hardware-accelerated translucency effects.</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label className="text-sm font-black italic">High-Density Task View</Label>
                                        <p className="text-[10px] text-muted-foreground font-medium">Show more metadata on Kanban cards by default.</p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                    <Card className="bg-card border-border overflow-hidden shadow-xl shadow-primary/5">
                        <CardHeader className="border-b border-border/50 bg-accent/5 pb-6">
                            <CardTitle className="font-black italic">Security & Access</CardTitle>
                            <CardDescription className="italic">Protect your digital footprint and active sessions.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Active Credentials</Label>
                                <div className="flex items-center justify-between p-5 rounded-2xl bg-accent/5 border border-border/50 shadow-sm group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <Shield className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-black tracking-tight text-sm">Authenticated User Session</p>
                                            <p className="text-[10px] text-muted-foreground font-mono">UID: {user?.id}</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-success/20 text-success border-none text-[8px] font-bold tracking-widest">VERIFIED</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
