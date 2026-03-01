"use client";

import * as React from "react";
import { Plus, Trash2, Webhook, Zap, ChevronRight, Save } from "lucide-react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    Dialog
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Variable,
    Library,
    Braces,
    ExternalLink,
    Code2,
    Database,
    Clock,
    User2,
    FileText
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Workflow, WorkflowAction } from "@/types";

interface WorkflowEditorProps {
    workflow?: Workflow;
    onSave: (data: Partial<Workflow>) => void;
}

export function WorkflowEditor({ workflow, onSave }: WorkflowEditorProps) {
    const [name, setName] = React.useState(workflow?.name || "");
    const [description, setDescription] = React.useState(workflow?.description || "");
    const [triggerType, setTriggerType] = React.useState<Workflow["triggerType"]>(workflow?.triggerType || "TASK_COMPLETED");
    const [actions, setActions] = React.useState<Partial<WorkflowAction>[]>(workflow?.actions || []);

    const addAction = () => {
        setActions([...actions, {
            type: "HTTP_REQUEST",
            name: "New Webhook",
            config: { url: "", method: "POST" },
            order: actions.length
        }]);
    };

    const [isLibraryOpen, setIsLibraryOpen] = React.useState(false);
    const [selectedActionIndex, setSelectedActionIndex] = React.useState<number | null>(null);

    const SAVED_APIS = [
        { name: "Slack Notification", method: "POST", url: "https://hooks.slack.com/services/...", body: '{"text": "Task {{task.title}} completed"}' },
        { name: "JIRA Ticket Creator", method: "POST", url: "https://your-domain.atlassian.net/rest/api/2/issue", body: '{"fields": {"project": {"key": "PROJ"}, "summary": "{{task.title}}" }}' },
        { name: "Email via SendGrid", method: "POST", url: "https://api.sendgrid.com/v3/mail/send", body: '{"personalizations": [{"to": [{"email": "user@example.com"}]}]}' }
    ];

    const applySavedApi = (api: typeof SAVED_APIS[0]) => {
        if (selectedActionIndex === null) return;
        const newActions = [...actions];
        newActions[selectedActionIndex] = {
            ...newActions[selectedActionIndex],
            name: api.name,
            config: { ...newActions[selectedActionIndex].config, url: api.url, method: api.method, body: api.body }
        };
        setActions(newActions);
        setIsLibraryOpen(false);
    };

    const updateActionField = (index: number, field: string, value: any) => {
        const newActions = [...actions];
        newActions[index] = { ...newActions[index], [field]: value };
        setActions(newActions);
    };

    const removeAction = (index: number) => {
        setActions(actions.filter((_, i) => i !== index));
    };

    const updateActionConfig = (index: number, key: string, value: string) => {
        const newActions = [...actions];
        newActions[index] = {
            ...newActions[index],
            config: { ...newActions[index].config, [key]: value }
        };
        setActions(newActions);
    };

    const handleSave = () => {
        onSave({
            name,
            description,
            triggerType,
            actions: actions as WorkflowAction[],
            isActive: workflow?.isActive ?? true
        });
    };

    return (
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    {workflow ? "Edit Workflow" : "Create New Workflow"}
                </DialogTitle>
                <DialogDescription>
                    Define when this automation should run and what it should do.
                </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
                {/* Basic Info */}
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Workflow Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Slack Alert on High Priority"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="What does this workflow do?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div className="h-px bg-border" />

                {/* Trigger Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary/10 text-primary border-primary/20">1</Badge>
                        <h3 className="font-bold text-sm">Define Trigger</h3>
                    </div>
                    <div className="grid gap-2">
                        <Label>When this event occurs...</Label>
                        <Select value={triggerType} onValueChange={(val: any) => setTriggerType(val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select trigger event" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TASK_COMPLETED">Task Completed</SelectItem>
                                <SelectItem value="PROJECT_CREATED">Project Created</SelectItem>
                                <SelectItem value="STORY_CREATED">User Story Created</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="h-px bg-border" />

                {/* Actions Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary/10 text-primary border-primary/20">2</Badge>
                            <h3 className="font-bold text-sm">Perform Actions</h3>
                        </div>
                        <Button variant="outline" size="sm" onClick={addAction} className="h-7 text-xs gap-1">
                            <Plus className="h-3.5 w-3.5" /> Add Action
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {actions.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-border rounded-lg bg-muted/20">
                                <p className="text-xs text-muted-foreground">No actions defined yet.</p>
                                <Button variant="link" size="sm" onClick={addAction}>Add your first action</Button>
                            </div>
                        ) : (
                            actions.map((action, index) => (
                                <div key={index} className="p-4 rounded-lg bg-card border border-border space-y-3 relative group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-1">
                                            <Webhook className="h-4 w-4 text-primary" />
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Action #{index + 1}:</span>
                                                <Input
                                                    value={action.name || "Webhook"}
                                                    onChange={(e) => updateActionField(index, "name", e.target.value)}
                                                    className="h-6 text-xs font-bold bg-transparent border-none focus-visible:ring-0 p-0 hover:bg-accent/50 rounded px-1 transition-colors"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeAction(index)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase text-muted-foreground">Webhook URL</Label>
                                        <Input
                                            placeholder="https://hooks.slack.com/services/..."
                                            className="h-8 text-xs font-mono"
                                            value={action.config?.url || ""}
                                            onChange={(e) => updateActionConfig(index, "url", e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase text-muted-foreground">HTTP Method</Label>
                                            <Select
                                                value={action.config?.method || "POST"}
                                                onValueChange={(val) => updateActionConfig(index, "method", val)}
                                            >
                                                <SelectTrigger className="h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="POST">POST</SelectItem>
                                                    <SelectItem value="GET">GET</SelectItem>
                                                    <SelectItem value="PUT">PUT</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-[10px] uppercase text-muted-foreground">Status</Label>
                                            <div className="h-8 flex items-center px-3 rounded-md bg-muted/50 text-[10px] font-medium">
                                                Active
                                            </div>
                                        </div>
                                    </div>

                                    {/* Advanced API Config */}
                                    <div className="space-y-4 pt-2 border-t border-border/50">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] uppercase text-muted-foreground">Request Body (JSON)</Label>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 text-[10px] gap-1 hover:bg-primary/10 hover:text-primary transition-colors"
                                                    onClick={() => {
                                                        const currentBody = action.config?.body || "{}";
                                                        try {
                                                            const json = JSON.parse(currentBody);
                                                            updateActionConfig(index, "body", JSON.stringify(json, null, 2));
                                                        } catch (e) { }
                                                    }}
                                                >
                                                    <Braces className="h-3 w-3" /> Format
                                                </Button>
                                                <Select onValueChange={(val) => {
                                                    const currentBody = action.config?.body || "";
                                                    updateActionConfig(index, "body", currentBody + ` {{${val}}}`);
                                                }}>
                                                    <SelectTrigger className="h-6 w-auto px-2 text-[10px] gap-1 bg-transparent border-none hover:bg-primary/10 hover:text-primary transition-colors">
                                                        <Variable className="h-3 w-3" /> Insert Variable
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-surface/90 backdrop-blur-xl border-border">
                                                        <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-accent/5">Common Variables</div>
                                                        <SelectItem value="task.title" className="text-xs">Task Title</SelectItem>
                                                        <SelectItem value="task.id" className="text-xs">Task ID</SelectItem>
                                                        <SelectItem value="project.name" className="text-xs">Project Name</SelectItem>
                                                        <SelectItem value="user.name" className="text-xs">Triggered By</SelectItem>
                                                        <SelectItem value="timestamp" className="text-xs">Current Time</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <Textarea
                                            placeholder='{ "text": "Hello NexusFlow!" }'
                                            className="min-h-[100px] text-xs font-mono bg-muted/30 border-border"
                                            value={action.config?.body || ""}
                                            onChange={(e) => updateActionConfig(index, "body", e.target.value)}
                                        />

                                        <div className="flex items-center gap-2 py-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full h-8 text-[10px] font-bold gap-2 border-border/50 bg-accent/5 hover:bg-accent/10"
                                                onClick={() => {
                                                    setSelectedActionIndex(index);
                                                    setIsLibraryOpen(true);
                                                }}
                                            >
                                                <Library className="h-3 w-3" /> Browse Saved APIs
                                            </Button>
                                            <Button variant="outline" size="sm" className="w-full h-8 text-[10px] font-bold gap-2 border-border/50 bg-accent/5 hover:bg-accent/10">
                                                <Save className="h-3 w-3" /> Save Template
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
                <DialogContent className="sm:max-w-[450px] bg-surface/95 backdrop-blur-2xl border-border shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Library className="h-5 w-5 text-primary" />
                            API Library
                        </DialogTitle>
                        <DialogDescription>
                            Select a pre-configured API template to quickly set up your action.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3 py-4">
                        {SAVED_APIS.map((api, idx) => (
                            <button
                                key={idx}
                                onClick={() => applySavedApi(api)}
                                className="flex flex-col items-start p-3 rounded-xl border border-border/40 bg-background/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                            >
                                <div className="flex items-center justify-between w-full mb-1">
                                    <span className="text-sm font-bold group-hover:text-primary transition-colors">{api.name}</span>
                                    <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tighter bg-primary/5 text-primary border-primary/20">
                                        {api.method}
                                    </Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground font-mono truncate w-full">{api.url}</p>
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            <DialogFooter className="mt-4 gap-2">
                <Button variant="outline" onClick={() => { }}>Cancel</Button>
                <Button onClick={handleSave} className="gap-2 font-bold">
                    <Save className="h-4 w-4" /> Save Workflow
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
