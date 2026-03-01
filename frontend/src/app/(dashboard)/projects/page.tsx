"use client";

import * as React from "react";
import {
    Plus,
    Filter,
    Search,
    AlertCircle,
    LayoutList,
    Kanban,
    BarChart3,
    Table as TableIcon,
    X,
    UserCheck,
    ChevronDown,
    Layers,
    Type
} from "lucide-react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { projectService } from "@/services/project.service";
import { userService } from "@/services/user.service";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskDetailDialog } from "@/components/shared/task-detail-dialog";
import { User, Project } from "@/types";
import { KanbanView } from "./components/kanban-view";
import { GanttView } from "./components/gantt-view";
import { ProjectCard } from "@/components/domain/project-card";
import { FeatureGuard } from "@/components/shared/feature-guard";

type KanbanLevel = "PROJECTS" | "STORIES" | "TASKS";

export default function ProjectsPage() {
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [kanbanLevel, setKanbanLevel] = React.useState<KanbanLevel>("PROJECTS");
    const [currentTab, setCurrentTab] = React.useState("list");

    // Search & Filter State
    const [searchQuery, setSearchQuery] = React.useState("");
    const [users, setUsers] = React.useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);

    // Task Detail Modal State
    const [selectedTask, setSelectedTask] = React.useState<any | null>(null);
    const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);

    React.useEffect(() => {
        const fetchProjects = async () => {
            try {
                setIsLoading(true);
                const data = await projectService.getProjects();
                setProjects(data);
            } catch (err: any) {
                console.error("Failed to fetch projects:", err);
                setError(err.message || "Failed to load projects.");
            } finally {
                setTimeout(() => setIsLoading(false), 300);
            }
        };

        const fetchUsers = async () => {
            try {
                const data = await userService.getUsers();
                setUsers(data as any);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };

        fetchProjects();
        fetchUsers();
    }, []);

    const handleTaskClick = (task: any) => {
        setSelectedTask(task);
        setIsTaskDialogOpen(true);
    };

    const toggleUserFilter = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const resetFilters = () => {
        setSelectedUserIds([]);
        setSearchQuery("");
    };

    const displayProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesOwner = selectedUserIds.length === 0 || (p.owner && selectedUserIds.includes(p.owner.id));
        return matchesSearch && matchesOwner;
    });

    return (
        <FeatureGuard feature="PROJECTS">
            <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                {/* Rigid Header */}
                <div className="flex-none px-6 pt-6 pb-4 border-b border-border/50 bg-background/95 backdrop-blur-md z-10 flex items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent italic uppercase leading-none">Project Portfolios</h1>
                        <p className="text-[10px] text-muted-foreground italic font-medium mt-1">Operational Initiative Management</p>
                    </div>
                    <Button className="font-black gap-2 h-10 px-6 shadow-xl shadow-primary/10 transition-all hover:scale-105 uppercase tracking-widest text-[10px] italic shrink-0">
                        <Plus className="h-3.5 w-3.5" /> New Initiative
                    </Button>
                </div>

                <Tabs defaultValue="list" className="flex-1 flex flex-col overflow-hidden" onValueChange={setCurrentTab}>
                    {/* Navigation & Controls Bar */}
                    <div className="flex-none px-6 py-3 border-b border-border/40 bg-background/50 flex items-center justify-between gap-4 z-10">
                        <div className="flex items-center gap-6">
                            <TabsList className="bg-surface/50 border border-border/50 p-1 h-9 rounded-xl">
                                <TabsTrigger value="list" className="gap-2 text-[9px] font-black uppercase tracking-widest px-4 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all">
                                    <LayoutList className="h-3 w-3" /> List
                                </TabsTrigger>
                                <TabsTrigger value="kanban" className="gap-2 text-[9px] font-black uppercase tracking-widest px-4 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all">
                                    <Kanban className="h-3 w-3" /> Kanban
                                </TabsTrigger>
                                <TabsTrigger value="gantt" className="gap-2 text-[9px] font-black uppercase tracking-widest px-4 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all">
                                    <BarChart3 className="h-3 w-3" /> Gantt
                                </TabsTrigger>
                                <TabsTrigger value="table" className="gap-2 text-[9px] font-black uppercase tracking-widest px-4 h-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all">
                                    <TableIcon className="h-3 w-3" /> Table
                                </TabsTrigger>
                            </TabsList>

                            {/* Visualization Dropdown - ONLY in Kanban View */}
                            {currentTab === "kanban" && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-9 w-56 border-border/50 rounded-xl bg-surface/30 hover:bg-surface/50 transition-all px-4 group flex items-center">
                                            <Layers className="h-3.5 w-3.5 text-primary opacity-70 group-hover:opacity-100" />
                                            <span className="text-[9px] font-black uppercase tracking-widest italic flex-1 text-right mr-2">Visual Logic : {kanbanLevel} </span>
                                            <ChevronDown className="h-3 w-3 opacity-30 group-hover:opacity-100" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-1 bg-surface/95 backdrop-blur-xl border-border rounded-2xl shadow-2xl" align="start">
                                        {(["PROJECTS", "STORIES", "TASKS"] as KanbanLevel[]).map((level) => (
                                            <DropdownMenuItem
                                                key={level}
                                                onClick={() => setKanbanLevel(level)}
                                                className={cn(
                                                    "justify-end gap-3 text-[10px] font-black uppercase tracking-widest p-3 rounded-xl cursor-pointer transition-all",
                                                    kanbanLevel === level ? "bg-primary text-primary-foreground" : "hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {level}
                                                <Type className="h-3.5 w-3.5" />
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Improved User Filter */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className={cn(
                                        "h-9 px-4 gap-3 border-border/50 rounded-xl bg-surface/30 hover:bg-surface/50 transition-all group relative",
                                        selectedUserIds.length > 0 && "border-primary/50 bg-primary/5"
                                    )}>
                                        <Filter className={cn("h-3.5 w-3.5 transition-colors", selectedUserIds.length > 0 ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                                        <span className="text-[9px] font-black uppercase tracking-widest italic">Users</span>
                                        {selectedUserIds.length > 0 && (
                                            <Badge className="ml-1 h-4 w-4 p-0 flex items-center justify-center bg-primary text-[8px] font-black rounded-full text-white">{selectedUserIds.length}</Badge>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-[240px] p-1 bg-surface/95 backdrop-blur-xl border-border rounded-2xl shadow-2xl overflow-hidden" align="end">
                                    <div className="p-3 border-b border-border/10 bg-accent/5 flex items-center justify-between">
                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Select Personnel</h4>
                                        {selectedUserIds.length > 0 && (
                                            <Button variant="ghost" size="sm" onClick={() => setSelectedUserIds([])} className="h-6 text-[8px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 px-2 rounded-lg">Reset</Button>
                                        )}
                                    </div>
                                    <div className="p-1 max-h-[300px] overflow-y-auto custom-scrollbar space-y-0.5">
                                        {users.map(user => (
                                            <div
                                                key={user.id}
                                                className="flex items-center gap-3 p-2.5 hover:bg-primary/5 rounded-xl transition-all cursor-pointer group"
                                                onClick={() => toggleUserFilter(user.id)}
                                            >
                                                <Checkbox checked={selectedUserIds.includes(user.id)} className="rounded-md h-4 w-4 pointer-events-none" />
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-[8px] font-black border border-border">
                                                        {user.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-[10px] font-black text-foreground/70 uppercase tracking-tight group-hover:text-foreground">{user.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Search aligned to right */}
                            <div className="relative group w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Locate initiatives..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 bg-surface/30 border-border/50 h-9 rounded-xl focus:ring-primary/10 focus:border-primary/20 transition-all text-[10px] font-medium italic"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden bg-accent/5 flex flex-col mx-6 mb-6 rounded-[2.5rem] border border-border/40 shadow-2xl shadow-black/20 relative group/content">
                        {/* Inner Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover/content:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-[2.5rem]" />

                        {selectedUserIds.length > 0 && (
                            <div className="flex-none px-6 pt-6 pb-2 items-center flex gap-2 animate-in slide-in-from-left-2 duration-300 z-10">
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 italic mr-2">Signals Filtering:</span>
                                <Badge variant="secondary" className="gap-2 bg-surface/80 border-border/50 text-[10px] font-black py-1.5 px-3 rounded-xl">
                                    <UserCheck className="h-3 w-3 text-primary" /> {selectedUserIds.length} ACTIVE PERSONNEL
                                    <X className="h-3 w-3 ml-1 cursor-pointer hover:text-primary transition-colors" onClick={() => setSelectedUserIds([])} />
                                </Badge>
                                <Button variant="ghost" className="h-7 text-[9px] font-black uppercase tracking-widest text-muted-foreground/30 hover:text-primary px-3" onClick={resetFilters}>Clear Matrix</Button>
                            </div>
                        )}

                        <div className="flex-1 overflow-hidden z-10">
                            <TabsContent value="list" className="mt-0 focus-visible:outline-none h-full overflow-y-auto custom-scrollbar px-6 py-6 pb-12">
                                {isLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <Skeleton key={i} className="h-56 rounded-3xl bg-surface/50 border border-border/50" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {error && (
                                            <div className="flex items-center gap-3 px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 mb-8 animate-in shake-in">
                                                <AlertCircle className="h-4 w-4" />
                                                {error}
                                            </div>
                                        )}
                                        {displayProjects.length === 0 ? (
                                            <Card className="bg-surface/30 border-border border-dashed py-32 rounded-[2.5rem] shadow-sm">
                                                <div className="flex flex-col items-center justify-center text-center px-6">
                                                    <div className="p-8 bg-muted/20 rounded-full mb-8 border border-border/50">
                                                        <Search className="h-10 w-10 text-muted-foreground/30" />
                                                    </div>
                                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Negative Signal Match</h3>
                                                    <p className="text-muted-foreground max-w-sm mt-3 text-[11px] italic font-medium leading-relaxed uppercase tracking-widest opacity-60">
                                                        Operational controls yielded zero correlations. Broaden search matrix.
                                                    </p>
                                                    <Button variant="outline" className="mt-10 font-black text-[10px] uppercase tracking-widest border-border/50 rounded-2xl h-11 px-8 shadow-sm hover:bg-surface transition-all" onClick={resetFilters}>
                                                        Reset All Filters
                                                    </Button>
                                                </div>
                                            </Card>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                                {displayProjects.map((project) => (
                                                    <ProjectCard key={project.id} project={project} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="kanban" className="mt-0 h-full px-6 py-2 overflow-hidden pb-6">
                                <KanbanView
                                    level={kanbanLevel}
                                    onLevelChange={setKanbanLevel}
                                    selectedUserIds={selectedUserIds}
                                    onTaskClick={handleTaskClick}
                                />
                            </TabsContent>

                            <TabsContent value="gantt" className="mt-0 h-full p-6">
                                <GanttView
                                    selectedUserIds={selectedUserIds}
                                    onTaskClick={handleTaskClick}
                                />
                            </TabsContent>

                            <TabsContent value="table" className="mt-0 h-full overflow-y-auto px-6 py-6 pb-12">
                                <div className="p-32 text-center bg-surface/30 border border-border/50 rounded-[2.5rem] border-dashed">
                                    <TableIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-6" />
                                    <h3 className="text-xl font-black italic uppercase tracking-widest">Advanced Matrix View</h3>
                                    <p className="text-[10px] text-muted-foreground mt-3 italic font-black uppercase tracking-widest opacity-50">Grid Optimization in Progress</p>
                                </div>
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>

                <TaskDetailDialog
                    isOpen={isTaskDialogOpen}
                    onClose={() => setIsTaskDialogOpen(false)}
                    task={selectedTask}
                />
            </div>
        </FeatureGuard>
    );
}
