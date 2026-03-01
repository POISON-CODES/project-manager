"use client";

import { useState, useEffect } from "react";
import {
    User,
    Shield,
    CheckCircle2,
    XCircle,
    UserCog,
    MoreVertical,
    Search,
    Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn, getInitials } from "@/lib/utils";
import api from "@/lib/api";
import { UserTableSkeleton } from "@/components/shared/skeletons";
import { FeatureGuard } from "@/components/shared/feature-guard";

export default function UserManagementPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/users");
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdateStatus = async (userId: string, status: string) => {
        try {
            await api.patch(`/users/${userId}/status`, { status });
            toast.success(`User ${status.toLowerCase()} successfully`);
            fetchUsers();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleUpdateRole = async (userId: string, role: string) => {
        try {
            await api.patch(`/users/${userId}/role`, { role });
            toast.success(`Role updated to ${role}`);
            fetchUsers();
        } catch (error) {
            toast.error("Failed to update role");
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "PENDING": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
            case "REJECTED": return "bg-red-500/10 text-red-500 border-red-500/20";
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    return (
        <FeatureGuard feature="ADMIN_CONTROLS">
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage user permissions, roles, and account approvals.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users..."
                            className="pl-8 bg-surface"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                    </Button>
                </div>

                {isLoading ? (
                    <UserTableSkeleton />
                ) : (
                    <Card className="bg-surface border-border shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border bg-accent/50">
                                        <th className="p-4 text-xs font-bold uppercase tracking-wider">User</th>
                                        <th className="p-4 text-xs font-bold uppercase tracking-wider">Role</th>
                                        <th className="p-4 text-xs font-bold uppercase tracking-wider">Status</th>
                                        <th className="p-4 text-xs font-bold uppercase tracking-wider">Joined</th>
                                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50 text-sm">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-accent/30 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-border">
                                                        <AvatarImage src={user.avatarUrl} />
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                                            {getInitials(user.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold">{user.name}</span>
                                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className="font-bold text-[10px] tracking-wider uppercase">
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={cn("font-bold text-[10px] tracking-wider uppercase", getStatusColor(user.status))}>
                                                    {user.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-muted-foreground">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {user.status === "PENDING" && (
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                                                onClick={() => handleUpdateStatus(user.id, "APPROVED")}
                                                            >
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                                onClick={() => handleUpdateStatus(user.id, "REJECTED")}
                                                            >
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel>Manage Roles</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "ADMIN")}>
                                                                <Shield className="mr-2 h-4 w-4" /> Make Admin
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "PROJECT_LEAD")}>
                                                                <UserCog className="mr-2 h-4 w-4" /> Make Project Lead
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "MEMBER")}>
                                                                <User className="mr-2 h-4 w-4" /> Make Member
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "STAKEHOLDER")}>
                                                                <Shield className="mr-2 h-4 w-4 text-muted-foreground" /> Make Stakeholder
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => handleUpdateStatus(user.id, "REJECTED")}
                                                            >
                                                                <XCircle className="mr-2 h-4 w-4" /> Suspend Account
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </FeatureGuard>
    );
}
