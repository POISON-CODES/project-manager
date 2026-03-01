"use client";

import * as React from "react";
import {
    Plus,
    Trash2,
    Type,
    Hash,
    List,
    AlignLeft,
    CheckSquare,
    Save,
    GripVertical,
    Settings2
} from "lucide-react";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FormTemplate, FormField } from "@/types";

interface FormBuilderProps {
    template?: FormTemplate;
    onSave: (data: Partial<FormTemplate>) => void;
}

const FIELD_TYPES = [
    { value: "text", label: "Short Text", icon: Type },
    { value: "textarea", label: "Long Text", icon: AlignLeft },
    { value: "number", label: "Number", icon: Hash },
    { value: "select", label: "Dropdown", icon: List },
    { value: "checkbox", label: "Checkbox", icon: CheckSquare },
];

export function FormBuilder({ template, onSave }: FormBuilderProps) {
    const [title, setTitle] = React.useState(template?.title || "");
    const [description, setDescription] = React.useState(template?.description || "");
    const [fields, setFields] = React.useState<FormField[]>(template?.fields || []);

    const addField = () => {
        const newField: FormField = {
            id: `field_${Math.random().toString(36).substr(2, 9)}`,
            label: "New Field",
            type: "text",
            required: false,
            placeholder: ""
        };
        setFields([...fields, newField]);
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const handleSave = () => {
        onSave({
            title,
            description,
            fields,
            version: "1.0.0", // Simple versioning for now
            isActive: template?.isActive ?? true,
            isDefault: template?.isDefault ?? false
        });
    };

    return (
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0">
                <DialogTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    {template ? "Edit Form Template" : "Create Form Template"}
                </DialogTitle>
                <DialogDescription>
                    Design your intake form. These fields will be shown to users when they initiate a project.
                </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Basic Info */}
                <div className="grid gap-4">
                    <div className="grid gap-1.5">
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input
                            id="template-name"
                            placeholder="e.g., Software Engineering Request"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-background border-border"
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="template-desc">Description</Label>
                        <Textarea
                            id="template-desc"
                            placeholder="Describe what this form is for..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-background border-border min-h-[80px]"
                        />
                    </div>
                </div>

                <div className="h-px bg-border" />

                {/* Fields Editor */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Form Fields</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={addField}
                            className="h-7 text-xs border-dashed border-primary/50 text-primary hover:bg-primary/5"
                        >
                            <Plus className="h-3.5 w-3.5 mr-1" /> Add Field
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {fields.length === 0 ? (
                            <div className="py-12 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center bg-muted/20">
                                <Plus className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                <p className="text-sm text-muted-foreground">No fields added yet.</p>
                                <Button variant="link" onClick={addField}>Add your first field</Button>
                            </div>
                        ) : (
                            fields.map((field, index) => (
                                <div key={field.id} className="p-4 rounded-xl bg-card border border-border space-y-4 relative group animate-in slide-in-from-left-2 duration-300">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="cursor-grab text-muted-foreground/30">
                                                <GripVertical className="h-4 w-4" />
                                            </div>
                                            <Badge variant="outline" className="text-[10px] font-mono h-5">#{index + 1}</Badge>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                            onClick={() => removeField(field.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs uppercase text-muted-foreground/70 tracking-tight">Label</Label>
                                            <Input
                                                value={field.label}
                                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                className="h-9 bg-background/50 text-sm"
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs uppercase text-muted-foreground/70 tracking-tight">Type</Label>
                                            <Select
                                                value={field.type}
                                                onValueChange={(val: any) => updateField(field.id, { type: val })}
                                            >
                                                <SelectTrigger className="h-9 bg-background/50 text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-surface/70 backdrop-blur-md border border-border shadow-2xl">
                                                    {FIELD_TYPES.map(type => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            <div className="flex items-center gap-2">
                                                                <type.icon className="h-4 w-4" />
                                                                <span>{type.label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs uppercase text-muted-foreground/70 tracking-tight">Placeholder (Optional)</Label>
                                            <Input
                                                value={field.placeholder || ""}
                                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                                className="h-9 bg-background/50 text-sm text-muted-foreground"
                                            />
                                        </div>
                                        <div className="flex items-center gap-4 h-9">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`req-${field.id}`}
                                                    checked={field.required}
                                                    onCheckedChange={(checked) => updateField(field.id, { required: checked === true })}
                                                />
                                                <Label htmlFor={`req-${field.id}`} className="text-xs font-medium cursor-pointer">Required</Label>
                                            </div>
                                        </div>
                                    </div>

                                    {field.type === "select" && (
                                        <div className="grid gap-1.5 pt-2 border-t border-border/50">
                                            <Label className="text-[10px] uppercase text-muted-foreground/70">Dropdown Options (Comma separated)</Label>
                                            <Input
                                                placeholder="e.g., Marketing, Engineering, HR"
                                                value={field.options?.join(", ") || ""}
                                                onChange={(e) => updateField(field.id, { options: e.target.value.split(",").map(s => s.trim()).filter(s => s !== "") })}
                                                className="h-8 text-xs bg-background/50 font-mono"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <DialogFooter className="p-6 border-t border-border bg-accent/5 gap-2">
                <Button variant="outline" onClick={() => { }}>Discard Changes</Button>
                <Button onClick={handleSave} className="gap-2 font-bold px-8">
                    <Save className="h-4 w-4" /> Save Template
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}
