"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    GripVertical,
    FileText,
    Settings,
    ChevronRight,
    Loader2,
    Layout,
    Database,
    AlertCircle,
    CheckCircle,
    ChevronDown,
    PlusSquare,
    Settings2,
    Layers,
    ArrowRight,
    Calendar,
    Clock,
    Timer,
    User,
    ExternalLink,
    Search,
    Type,
    Hash,
    Phone,
    Mail,
    File,
    Image as ImageIcon,
    List,
    ListChecks,
    CheckSquare as CheckboxIcon,
    AlignLeft
} from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formService } from "@/services/form.service";
import { FormTemplate, FormField } from "@/types";
import { toast } from "sonner";

// --- Versioning Logic ---
function calculateNewVersion(oldForm: FormTemplate, newForm: FormTemplate): string {
    const versionStr = oldForm.version || "v1.0.0";
    const [major, minor, patch] = versionStr.replace('v', '').split('.').map(Number);

    let fieldsChanged = 0;
    let structuralChange = false;

    const oldFields = Array.isArray(oldForm.fields) ? oldForm.fields : [];
    const newFields = Array.isArray(newForm.fields) ? newForm.fields : [];

    // Check structural changes (add/remove/type)
    if (oldFields.length !== newFields.length) {
        structuralChange = true;
    }

    // Compare fields
    newFields.forEach(nf => {
        const of = oldFields.find(f => f.id === nf.id);
        if (!of) {
            structuralChange = true;
        } else {
            if (of.type !== nf.type) structuralChange = true;
            if (
                of.label !== nf.label ||
                of.placeholder !== nf.placeholder ||
                of.required !== nf.required ||
                JSON.stringify(of.options) !== JSON.stringify(nf.options)
            ) {
                fieldsChanged++;
            }
        }
    });

    // Check metadata changes
    const metadataChanged = oldForm.title !== newForm.title || oldForm.description !== newForm.description;

    if (fieldsChanged > 5 || minor === 9) {
        return `v${major + 1}.0.0`;
    }

    if (structuralChange) {
        return `v${major}.${minor + 1}.0`;
    }

    if (fieldsChanged > 0 || metadataChanged) {
        if (patch === 9) {
            return `v${major}.${minor + 1}.0`;
        }
        return `v${major}.${minor}.${patch + 1}`;
    }

    return versionStr;
}

// --- Sortable Field Component ---
function SortableField({
    field,
    index,
    onEdit,
    onDelete
}: {
    field: FormField;
    index: number;
    onEdit: (field: FormField) => void;
    onDelete: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "text": return <Type className="h-4 w-4" />;
            case "number": return <Hash className="h-4 w-4" />;
            case "phone": return <Phone className="h-4 w-4" />;
            case "email": return <Mail className="h-4 w-4" />;
            case "document": return <File className="h-4 w-4" />;
            case "image": return <ImageIcon className="h-4 w-4" />;
            case "select": return <List className="h-4 w-4" />;
            case "multiselect": return <ListChecks className="h-4 w-4" />;
            case "textarea": return <AlignLeft className="h-4 w-4" />;
            case "checkbox": return <CheckboxIcon className="h-4 w-4" />;
            case "date": return <Calendar className="h-4 w-4" />;
            case "time": return <Clock className="h-4 w-4" />;
            case "datetime": return <Timer className="h-4 w-4" />;
            default: return <Database className="h-4 w-4" />;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group relative flex items-center gap-4 p-4 bg-surface/40 border border-border/50 rounded-2xl hover:border-primary/40 hover:bg-surface/60 transition-all shadow-sm cursor-grab active:cursor-grabbing"
        >
            <div className="opacity-20 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted/20 rounded shrink-0">
                <GripVertical className="h-4 w-4" />
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-black text-xs border border-primary/10 shrink-0">
                {index + 1}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
                <div className="space-y-1 overflow-hidden">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Label</p>
                    <p className="text-xs font-bold flex items-center gap-2 truncate">
                        {field.label}
                        {field.required && <Badge variant="destructive" className="h-3 px-1 text-[7px] uppercase font-black">Req</Badge>}
                    </p>
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Type</p>
                    <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest h-5 px-2 bg-muted/20 border-border gap-1.5 w-fit">
                        {getIcon(field.type)}
                        {field.type}
                    </Badge>
                </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(field);
                    }}
                >
                    <Settings className="h-3.5 w-3.5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(field.id);
                    }}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}

export default function FormEditPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params as { id: string };

    const [form, setForm] = React.useState<FormTemplate | null>(null);
    const [originalForm, setOriginalForm] = React.useState<FormTemplate | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);

    // Field Editor State
    const [editingField, setEditingField] = React.useState<FormField | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    React.useEffect(() => {
        const fetchForm = async () => {
            try {
                setIsLoading(true);
                const data = await formService.getForm(id);

                // --- Robust Field Extraction ---
                // If the fields array is empty but we have a schema (sections or fields), extract them.
                if ((!data.fields || data.fields.length === 0) && data.schema) {
                    const extractedFields = Array.isArray(data.schema)
                        ? data.schema
                        : (data.schema.fields || (data.schema.sections ? data.schema.sections.flatMap((s: any) => s.fields) : []));

                    // Filter out any nulls/undefined and ensure they have IDs
                    data.fields = (extractedFields || []).map((f: any, idx: number) => ({
                        ...f,
                        id: f.id || f.name || `field_${idx}`
                    }));
                }

                setForm(data);
                setOriginalForm(data);
            } catch (err) {
                toast.error("Failed to load form template");
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchForm();
    }, [id]);

    const handleSave = async () => {
        if (!form || !originalForm) return;
        try {
            setIsSaving(true);

            // Calculate new version based on changes
            const updatedVersion = calculateNewVersion(originalForm, form);
            const formToSave = { ...form, version: updatedVersion };

            await formService.updateForm(id, formToSave);
            toast.success(`Protocol updated to ${updatedVersion}`);
            router.push(`/admin/forms/${id}/preview`);
        } catch (err) {
            toast.error("Failed to publish version");
        } finally {
            setIsSaving(false);
        }
    };

    const addField = (type: FormField['type']) => {
        if (!form) return;
        const newField: FormField = {
            id: `field_${Date.now()}`,
            label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
            type,
            required: false,
            placeholder: "",
            options: (type === 'select' || type === 'multiselect') ? ['Option 1'] : undefined
        };

        // Transactional initialization: do not commit to form state yet
        setEditingField(newField);
        toast.info(`Initialized ${type} terminal specs`);
    };

    const deleteField = (fieldId: string) => {
        if (!form) return;
        const currentFields = Array.isArray(form.fields) ? form.fields : [];
        setForm({ ...form, fields: currentFields.filter(f => f.id !== fieldId) });
    };

    const updateField = (updatedField: FormField) => {
        if (!form) return;
        const currentFields = Array.isArray(form.fields) ? form.fields : [];
        const exists = currentFields.some(f => f.id === updatedField.id);

        setForm({
            ...form,
            fields: exists
                ? currentFields.map(f => f.id === updatedField.id ? updatedField : f)
                : [...currentFields, updatedField]
        });
        setEditingField(null);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setForm((prev) => {
                if (!prev) return prev;
                const oldIndex = prev.fields.findIndex((f) => f.id === active.id);
                const newIndex = prev.fields.findIndex((f) => f.id === over.id);
                return {
                    ...prev,
                    fields: arrayMove(prev.fields, oldIndex, newIndex),
                };
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background/50 backdrop-blur-md">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Initializing Protocol Architect...</p>
                </div>
            </div>
        );
    }

    if (!form) return null;

    return (
        <div className="flex flex-col h-full bg-background border border-border/50 rounded-3xl animate-in fade-in duration-500 overflow-hidden shadow-2xl shadow-primary/5 relative">
            {/* Header */}
            <div className="flex-none p-6 border-b border-border/50 bg-surface/30 backdrop-blur-md">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="p-2 rounded-xl bg-muted/10 hover:bg-primary/10 transition-colors cursor-pointer border border-border/50 shadow-sm"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                                Architecting Protocol: {form.title}
                            </h1>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Settings className="h-3 w-3" /> System ID: <span className="text-foreground">{id}</span>
                                <ChevronRight className="h-2 w-2" />
                                <span className="text-primary italic">Live Editor Active</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="font-black text-[10px] uppercase tracking-widest gap-2 bg-background/50"
                            onClick={() => router.push(`/admin/forms/${id}/preview`)}
                        >
                            <Layout className="h-3.5 w-3.5" /> Discard Changes
                        </Button>
                        <Button
                            size="sm"
                            className="font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            Publish Form
                        </Button>
                    </div>
                </div>
            </div>

            {/* Architecture Studio */}
            <div className="flex-1 grid grid-cols-12 min-h-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent overflow-hidden">
                {/* Left: Metadata & Settings */}
                <div className="col-span-4 border-r border-border/50 bg-muted/5 flex flex-col min-h-0 overflow-hidden">
                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-8 pb-12">
                            <section className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary italic flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5" /> Global Attributes
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Protocol Name</label>
                                        <Input
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            className="bg-surface border-border/50 rounded-xl h-11 text-sm font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</label>
                                        <Textarea
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            className="bg-surface border-border/50 rounded-xl min-h-[100px] text-sm italic py-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Version</label>
                                            <div className="bg-muted/10 border border-border/30 rounded-xl h-11 flex items-center px-4 font-mono text-xs text-primary font-black italic">
                                                {form.version}
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-center flex flex-col justify-center">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Visibility</label>
                                            <Badge className={cn("mx-auto h-7 px-4", form.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted text-muted-foreground")}>
                                                {form.isActive ? "LIVE" : "DRAFT"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <Separator className="opacity-30" />

                            <section className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary italic flex items-center gap-2">
                                    <AlertCircle className="h-3.5 w-3.5" /> System Rules
                                </h3>
                                <Card className="p-4 bg-surface/50 border-border/50 rounded-2xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Auto-Initialize Project</span>
                                        <div className="h-5 w-10 rounded-full bg-primary/20 relative cursor-pointer border border-primary/30">
                                            <div className="absolute top-0.5 right-0.5 h-3.5 w-3.5 bg-primary rounded-full" />
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground font-medium italic">When enabled, successful submissions will immediately spawn a new project container in the WORKSPACE.</p>
                                </Card>
                            </section>
                        </div>
                    </ScrollArea>
                </div>

                {/* Right: Field Architecture */}
                <div className="col-span-8 flex flex-col min-h-0 overflow-hidden bg-background">
                    <div className="flex-none p-6 pb-0 flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-lg font-black tracking-tight uppercase italic flex items-center gap-3">
                                <span className="h-5 w-1 bg-primary rounded-full shadow-[0_0_8px_var(--primary)]" />
                                Data Schema Canvas
                            </h2>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Drag and drop architecture to define the intake payload.</p>
                        </div>
                        {form.fields && form.fields.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" className="font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/20">
                                        <Plus className="h-3.5 w-3.5" /> Build More
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-surface/90 backdrop-blur-xl border-border p-2">
                                    <div className="p-2 text-[9px] font-black uppercase text-muted-foreground tracking-widest">Base Inputs</div>
                                    <DropdownMenuItem onClick={() => addField("text")} className="gap-2 text-[10px] font-black uppercase"><Type className="h-3 w-3" /> Text Terminal</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => addField("number")} className="gap-2 text-[10px] font-black uppercase"><Hash className="h-3 w-3" /> Numeric Probe</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => addField("phone")} className="gap-2 text-[10px] font-black uppercase"><Phone className="h-3 w-3" /> Comms Link</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => addField("email")} className="gap-2 text-[10px] font-black uppercase"><Mail className="h-3 w-3" /> Data Address</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => addField("textarea")} className="gap-2 text-[10px] font-black uppercase"><AlignLeft className="h-3 w-3" /> Block Payload</DropdownMenuItem>
                                    <div className="p-2 pt-4 text-[9px] font-black uppercase text-secondary tracking-widest">Complex Media</div>
                                    <DropdownMenuItem onClick={() => addField("document")} className="gap-2 text-[10px] font-black uppercase"><File className="h-3 w-3" /> Doc Archive</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => addField("image")} className="gap-2 text-[10px] font-black uppercase"><ImageIcon className="h-3 w-3" /> Image Matrix</DropdownMenuItem>
                                    <div className="p-2 pt-4 text-[9px] font-black uppercase text-primary tracking-widest">Flow Controls</div>
                                    <DropdownMenuItem onClick={() => addField("select")} className="gap-2 text-[10px] font-black uppercase"><List className="h-3 w-3" /> Signal Selector</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => addField("multiselect")} className="gap-2 text-[10px] font-black uppercase"><ListChecks className="h-3 w-3" /> Multi-Bit Array</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => addField("checkbox")} className="gap-2 text-[10px] font-black uppercase"><CheckboxIcon className="h-3 w-3" /> Binary Toggle</DropdownMenuItem>
                                    <div className="p-2 pt-4 text-[9px] font-black uppercase text-rose-400 tracking-widest">Temporal Log</div>
                                    <DropdownMenuItem onClick={() => addField("date")} className="gap-2 text-[10px] font-black uppercase"><Calendar className="h-3 w-3" /> Chrono Date</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => addField("time")} className="gap-2 text-[10px] font-black uppercase"><Clock className="h-3 w-3" /> Time Stamp</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => addField("datetime")} className="gap-2 text-[10px] font-black uppercase"><Timer className="h-3 w-3" /> Sync Full Temporal</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <ScrollArea className="flex-1 p-8">
                        <div className="max-w-3xl mx-auto space-y-10 pb-20">
                            {/* Visual Editor Placeholder */}
                            {form.fields && form.fields.length > 0 ? (
                                <div className="space-y-4">
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                        modifiers={[restrictToVerticalAxis]}
                                    >
                                        <SortableContext
                                            items={form.fields.map(f => f.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {form.fields.map((field, idx) => (
                                                <SortableField
                                                    key={field.id}
                                                    field={field}
                                                    index={idx}
                                                    onEdit={setEditingField}
                                                    onDelete={deleteField}
                                                />
                                            ))}
                                        </SortableContext>
                                    </DndContext>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="w-full py-6 border-2 border-dashed border-border/20 rounded-3xl flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground group">
                                                <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic group-hover:text-primary transition-colors">Build More</span>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 bg-surface/90 backdrop-blur-xl border-border p-2">
                                            <div className="p-2 text-[9px] font-black uppercase text-muted-foreground tracking-widest">Base Inputs</div>
                                            <DropdownMenuItem onClick={() => addField("text")} className="gap-2 text-[10px] font-black uppercase"><Type className="h-3 w-3" /> Text Terminal</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("number")} className="gap-2 text-[10px] font-black uppercase"><Hash className="h-3 w-3" /> Numeric Probe</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("phone")} className="gap-2 text-[10px] font-black uppercase"><Phone className="h-3 w-3" /> Comms Link</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("email")} className="gap-2 text-[10px] font-black uppercase"><Mail className="h-3 w-3" /> Data Address</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("textarea")} className="gap-2 text-[10px] font-black uppercase"><AlignLeft className="h-3 w-3" /> Block Payload</DropdownMenuItem>
                                            <div className="p-2 pt-4 text-[9px] font-black uppercase text-secondary tracking-widest">Complex Media</div>
                                            <DropdownMenuItem onClick={() => addField("document")} className="gap-2 text-[10px] font-black uppercase"><File className="h-3 w-3" /> Doc Archive</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("image")} className="gap-2 text-[10px] font-black uppercase"><ImageIcon className="h-3 w-3" /> Image Matrix</DropdownMenuItem>
                                            <div className="p-2 pt-4 text-[9px] font-black uppercase text-primary tracking-widest">Flow Controls</div>
                                            <DropdownMenuItem onClick={() => addField("select")} className="gap-2 text-[10px] font-black uppercase"><List className="h-3 w-3" /> Signal Selector</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("multiselect")} className="gap-2 text-[10px] font-black uppercase"><ListChecks className="h-3 w-3" /> Multi-Bit Array</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("checkbox")} className="gap-2 text-[10px] font-black uppercase"><CheckboxIcon className="h-3 w-3" /> Binary Toggle</DropdownMenuItem>
                                            <div className="p-2 pt-4 text-[9px] font-black uppercase text-rose-400 tracking-widest">Temporal Log</div>
                                            <DropdownMenuItem onClick={() => addField("date")} className="gap-2 text-[10px] font-black uppercase"><Calendar className="h-3 w-3" /> Chrono Date</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("time")} className="gap-2 text-[10px] font-black uppercase"><Clock className="h-3 w-3" /> Time Stamp</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("datetime")} className="gap-2 text-[10px] font-black uppercase"><Timer className="h-3 w-3" /> Sync Full Temporal</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                <div className="py-24 text-center border-2 border-dashed border-border/20 rounded-[3rem] opacity-30 flex flex-col items-center justify-center">
                                    <div className="h-16 w-16 rounded-3xl bg-muted/20 flex items-center justify-center mb-6">
                                        <Database className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter italic mb-2">Schema Core Empty</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Begin building the protocol architecture by adding dynamic fields.</p>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button className="mt-8 font-black text-xs uppercase tracking-widest italic gap-2 h-12 px-8 rounded-2xl shadow-xl shadow-primary/20">
                                                <PlusSquare className="h-4 w-4" /> Start Architecting
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="center" className="w-64 bg-surface/95 backdrop-blur-xl border-border p-2 shadow-2xl">
                                            <div className="p-2 text-[9px] font-black uppercase text-muted-foreground tracking-widest">Base Inputs</div>
                                            <DropdownMenuItem onClick={() => addField("text")} className="gap-2 text-[10px] font-black uppercase"><Type className="h-3 w-3" /> Text Terminal</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("number")} className="gap-2 text-[10px] font-black uppercase"><Hash className="h-3 w-3" /> Numeric Probe</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("phone")} className="gap-2 text-[10px] font-black uppercase"><Phone className="h-3 w-3" /> Comms Link</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("email")} className="gap-2 text-[10px] font-black uppercase"><Mail className="h-3 w-3" /> Data Address</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("textarea")} className="gap-2 text-[10px] font-black uppercase"><AlignLeft className="h-3 w-3" /> Block Payload</DropdownMenuItem>

                                            <div className="p-2 pt-4 text-[9px] font-black uppercase text-secondary tracking-widest">Complex Media</div>
                                            <DropdownMenuItem onClick={() => addField("document")} className="gap-2 text-[10px] font-black uppercase"><File className="h-3 w-3" /> Doc Archive</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("image")} className="gap-2 text-[10px] font-black uppercase"><ImageIcon className="h-3 w-3" /> Image Matrix</DropdownMenuItem>

                                            <div className="p-2 pt-4 text-[9px] font-black uppercase text-primary tracking-widest">Flow Controls</div>
                                            <DropdownMenuItem onClick={() => addField("select")} className="gap-2 text-[10px] font-black uppercase"><List className="h-3 w-3" /> Signal Selector</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("multiselect")} className="gap-2 text-[10px] font-black uppercase"><ListChecks className="h-3 w-3" /> Multi-Bit Array</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("checkbox")} className="gap-2 text-[10px] font-black uppercase"><CheckboxIcon className="h-3 w-3" /> Binary Toggle</DropdownMenuItem>

                                            <div className="p-2 pt-4 text-[9px] font-black uppercase text-rose-400 tracking-widest">Temporal Log</div>
                                            <DropdownMenuItem onClick={() => addField("date")} className="gap-2 text-[10px] font-black uppercase"><Calendar className="h-3 w-3" /> Chrono Date</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("time")} className="gap-2 text-[10px] font-black uppercase"><Clock className="h-3 w-3" /> Time Stamp</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => addField("datetime")} className="gap-2 text-[10px] font-black uppercase"><Timer className="h-3 w-3" /> Sync Full Temporal</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Field Configuration Dialog */}
            <Dialog open={!!editingField} onOpenChange={(open) => !open && setEditingField(null)}>
                <DialogContent className="sm:max-w-[500px] bg-surface/95 backdrop-blur-2xl border-border rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                            <Settings className="h-5 w-5 text-primary" />
                            Refine Terminal Specs
                        </DialogTitle>
                        <DialogDescription className="italic">
                            Configure logical parameters for the <span className="text-primary font-bold">[{editingField?.label}]</span> unit.
                        </DialogDescription>
                    </DialogHeader>

                    {editingField && (
                        <div className="space-y-6 py-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Functional Label</Label>
                                    <Input
                                        value={editingField.label}
                                        onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                                        className="bg-background border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Shadow Placeholder</Label>
                                    <Input
                                        value={editingField.placeholder}
                                        onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                                        className="bg-background border-border"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                    <div className="space-y-0.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest">Systemic Mandate</Label>
                                        <p className="text-[9px] text-muted-foreground italic">If enabled, submission requires valid data in this terminal.</p>
                                    </div>
                                    <Switch
                                        checked={editingField.required}
                                        onCheckedChange={(checked) => setEditingField({ ...editingField, required: checked })}
                                    />
                                </div>

                                {(editingField.type === "select" || editingField.type === "multiselect") && (
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Options Matrix</Label>
                                        <div className="space-y-2">
                                            {editingField.options?.map((opt, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <Input
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const newOpts = [...(editingField.options || [])];
                                                            newOpts[idx] = e.target.value;
                                                            setEditingField({ ...editingField, options: newOpts });
                                                        }}
                                                        className="bg-background border-border text-xs"
                                                    />
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-9 w-9 text-destructive"
                                                        onClick={() => {
                                                            setEditingField({
                                                                ...editingField,
                                                                options: editingField.options?.filter((_, i) => i !== idx)
                                                            });
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full text-[10px] font-black uppercase tracking-widest h-9 border-dashed"
                                                onClick={() => {
                                                    setEditingField({
                                                        ...editingField,
                                                        options: [...(editingField.options || []), `Option ${(editingField.options?.length || 0) + 1}`]
                                                    });
                                                }}
                                            >
                                                <Plus className="h-3 w-3 mr-2" /> Append Option
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditingField(null)} className="font-bold text-[10px] uppercase tracking-widest">Abort</Button>
                        <Button
                            onClick={() => editingField && updateField(editingField)}
                            className="bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest px-8 shadow-lg shadow-primary/20"
                        >
                            Sync Specifications
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
