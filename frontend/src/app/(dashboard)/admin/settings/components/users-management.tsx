"use client";

import * as React from "react";
import {
    Search,
    MoreHorizontal,
    Shield,
    ShieldAlert,
    Target,
    CheckCircle2,
    Clock,
    Mail,
    Phone,
    Edit3,
    BarChart3,
    Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { userService } from "@/services/user.service";
import { User, UserRole } from "@/types";
import { toast } from "sonner";
import { cn, getInitials } from "@/lib/utils";

export function UsersManagement({ currentUser }: { currentUser: User | null }) {
    const [users, setUsers] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedUser, setSelectedUser] = React.useState<any | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [newRole, setNewRole] = React.useState<string>("");
    const [isUpdating, setIsUpdating] = React.useState(false);
    const router = useRouter();



    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const data = await userService.getManagementUsers();
            setUsers(data);
        } catch (error: any) {
            console.error("Failed to fetch users:", error);
            const message = error.response?.data?.message || "Check your administrative privileges or database connection.";
            toast.error("Access Denied or System Error", {
                description: message
            });
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user: any) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUpdateRole = async () => {
        if (!selectedUser || !newRole) return;

        setIsUpdating(true);
        try {
            const res = await userService.updateUserRole(selectedUser.id, newRole);
            if (res.success === false) {
                toast.error(res.message || "Failed to update role");
            } else {
                toast.success(`Role updated for ${selectedUser.name}`);
                setIsEditDialogOpen(false);
                fetchUsers();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update role");
        } finally {
            setIsUpdating(false);
        }
    };

    const canEditRole = (targetUser: any) => {
        if (!currentUser || currentUser.role !== "ADMIN") return false;
        // Cannot edit other admins
        if (targetUser.role === "ADMIN" && targetUser.id !== currentUser.id) return false;
        return true;
    };

    if (isLoading) {
        return (
            <div className="flex h-[300px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-surface/50 border-border/50"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredUsers.map((user) => (
                    <Card key={user.id} className="bg-surface/30 backdrop-blur-md border-border/50 hover:border-primary/30 transition-all group overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                                {/* User Info */}
                                <div className="flex items-center gap-4 min-w-[250px]">
                                    <Avatar className="h-12 w-12 border-2 border-border/50 group-hover:border-primary/30 transition-colors">
                                        <AvatarImage src={user.avatarUrl} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-black">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-black tracking-tight">{user.name}</h3>
                                            {user.role === "ADMIN" ? (
                                                <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[8px] font-black tracking-widest px-1.5 h-4">ADMIN</Badge>
                                            ) : (
                                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black tracking-widest px-1.5 h-4">{user.role}</Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1 text-[10px] text-muted-foreground font-medium italic">
                                            <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {user.email}</span>
                                            {user.phoneNumber && <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {user.phoneNumber}</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 w-full border-l border-border/10 pl-0 lg:pl-6">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active Projects</p>
                                        <div className="flex items-center gap-2">
                                            <Target className="h-3.5 w-3.5 text-primary" />
                                            <span className="text-sm font-black tracking-tight">{user.stats?.activeProjects || 0}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Tasks Done</p>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                                            <span className="text-sm font-black tracking-tight">{user.stats?.completedTasks || 0}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Pending Work</p>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5 text-orange-500" />
                                            <span className="text-sm font-black tracking-tight">{user.stats?.activeTasks || 0}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Engagement</p>
                                        <div className="flex items-center gap-2">
                                            <BarChart3 className="h-3.5 w-3.5 text-indigo-500" />
                                            <span className="text-sm font-black tracking-tight">
                                                {user.stats?.totalTasks > 0 ? Math.round((user.stats.completedTasks / user.stats.totalTasks) * 100) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-surface/90 backdrop-blur-xl border-border">
                                            <DropdownMenuLabel className="text-[10px] uppercase font-black opacity-50">Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-border/50" />
                                            <DropdownMenuItem
                                                className="text-xs font-bold gap-2 cursor-pointer"
                                                onClick={() => {
                                                    if (router) {
                                                        router.push(`/admin/users/${user.id}/stats`);
                                                    } else {
                                                        window.location.href = `/admin/users/${user.id}/stats`;
                                                    }
                                                }}
                                            >
                                                <BarChart3 className="h-3.5 w-3.5" /> View Detailed Stats
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-xs font-bold gap-2 cursor-pointer"
                                                disabled={!canEditRole(user)}
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setNewRole(user.role);
                                                    setIsEditDialogOpen(true);
                                                }}
                                            >
                                                <Edit3 className="h-3.5 w-3.5" /> Edit Role & Permissions
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredUsers.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-border/20 rounded-3xl">
                        <p className="text-sm text-muted-foreground font-medium italic">No users found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Edit Role Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-surface/95 backdrop-blur-2xl border-border shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Manage User Role
                        </DialogTitle>
                        <DialogDescription className="italic">
                            Change the operational role for <strong>{selectedUser?.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Operational Role</Label>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger className="bg-background/50 border-border h-11">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent className="bg-surface/90 backdrop-blur-xl border border-border">
                                    <SelectItem value="ADMIN" className="text-xs font-bold text-red-500">ADMIN (Full Access)</SelectItem>
                                    <SelectItem value="PROJECT_LEAD" className="text-xs font-bold">PROJECT LEAD (Manage Teams)</SelectItem>
                                    <SelectItem value="MEMBER" className="text-xs font-bold">MEMBER (Execute Tasks)</SelectItem>
                                    <SelectItem value="STAKEHOLDER" className="text-xs font-bold">STAKEHOLDER (View Only)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {newRole === "ADMIN" && (
                            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 flex gap-3 text-red-500">
                                <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                                <div className="text-[10px] leading-relaxed">
                                    <p className="font-black uppercase tracking-widest mb-1">Security Warning</p>
                                    <p className="font-medium opacity-80">Promoting a user to ADMIN gives them full access to all projects, financial data, and system settings. This action cannot be undone by other project leads.</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="font-bold">Cancel</Button>
                        <Button
                            onClick={handleUpdateRole}
                            disabled={isUpdating || newRole === selectedUser?.role}
                            className="font-black gap-2 shadow-lg shadow-primary/20"
                        >
                            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                            Apply Role Profile
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </div>
    );
}