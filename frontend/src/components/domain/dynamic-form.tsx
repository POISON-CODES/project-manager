"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormTemplate } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FileUp, Image as ImageIcon, ChevronRight, Hash, Type, Mail, Phone, List, CheckSquare, Layers, AlertCircle, X, ChevronDown, Check, Search, Calendar, Clock, Timer } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DynamicFormProps {
    template: FormTemplate;
    onSubmit: (data: any) => void;
    className?: string;
    formId?: string;
    hideSubmit?: boolean;
}

/**
 * DynamicForm Component.
 * Renders a form based on a FormTemplate schema.
 * Handles validation and submission automatically.
 */
export function DynamicForm({ template, onSubmit, className, formId, hideSubmit = false }: DynamicFormProps) {
    // Build a dynamic Zod schema based on the template fields
    const schemaGroup: any = {};
    template.fields.forEach((field) => {
        let fieldSchema: any = z.any();

        switch (field.type) {
            case "email":
                fieldSchema = z.string().email("Invalid email format");
                break;
            case "phone":
                fieldSchema = z.string().min(10, "Invalid phone number"); // Basic check
                break;
            case "text":
            case "textarea":
            case "select":
            case "document":
            case "image":
            case "date":
            case "time":
            case "datetime":
                fieldSchema = z.string();
                break;
            case "multiselect":
                fieldSchema = z.array(z.string());
                break;
            case "number":
                fieldSchema = z.coerce.number();
                break;
            case "checkbox":
                fieldSchema = z.boolean().default(false);
                break;
            default:
                fieldSchema = z.any();
        }

        if (field.required && field.type !== "checkbox" && field.type !== "multiselect") {
            if (typeof fieldSchema.min === "function") {
                fieldSchema = fieldSchema.min(1, `${field.label} is required`);
            }
        } else if (field.required && field.type === "multiselect") {
            fieldSchema = fieldSchema.min(1, `Select at least one ${field.label}`);
        } else {
            fieldSchema = fieldSchema.optional();
        }

        schemaGroup[field.id] = fieldSchema;
    });

    const dynamicSchema = z.object(schemaGroup);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(dynamicSchema),
    });

    const getFieldIcon = (type: string) => {
        switch (type) {
            case "number": return <Hash className="h-3 w-3" />;
            case "text": return <Type className="h-3 w-3" />;
            case "email": return <Mail className="h-3 w-3" />;
            case "phone": return <Phone className="h-3 w-3" />;
            case "select": return <List className="h-3 w-3" />;
            case "checkbox": return <CheckSquare className="h-3 w-3" />;
            case "textarea": return <Layers className="h-3 w-3" />;
            case "date": return <Calendar className="h-3 w-3" />;
            case "time": return <Clock className="h-3 w-3" />;
            case "datetime": return <Timer className="h-3 w-3" />;
            default: return null;
        }
    };

    return (
        <form
            id={formId}
            onSubmit={handleSubmit(onSubmit)}
            className={cn("space-y-8", className)}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
                {template.fields.map((field) => (
                    <div
                        key={field.id}
                        className={cn(
                            "space-y-3 group/field",
                            (field.type === "textarea" || field.type === "document" || field.type === "image") && "md:col-span-2"
                        )}
                    >
                        <div className="flex items-center justify-between ml-1.5 mb-1">
                            <Label htmlFor={field.id} className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/70 transition-colors group-focus-within/field:text-primary leading-none">
                                {field.label} {field.required && <span className="text-primary italic">*</span>}
                            </Label>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-bold opacity-20 uppercase tracking-[0.15em] italic">{field.id}</span>
                                <Badge variant="outline" className="text-[8px] font-black opacity-40 uppercase tracking-[0.2em] h-5 px-2 border-border/40 bg-surface-raised/50 flex items-center gap-1.5 transition-all group-focus-within/field:opacity-100 group-focus-within/field:border-primary/40 group-focus-within/field:bg-primary/5">
                                    {getFieldIcon(field.type)}
                                    {field.type}
                                </Badge>
                            </div>
                        </div>

                        {field.type === "textarea" ? (
                            <div className="relative">
                                <Textarea
                                    id={field.id}
                                    placeholder={field.placeholder || "Describe protocol requirements..."}
                                    className="bg-surface/40 border-border/40 rounded-[1.2rem] min-h-[160px] text-sm focus:ring-primary/20 focus:border-primary/30 transition-all font-medium py-6 px-6 placeholder:italic placeholder:text-muted-foreground/30 custom-scrollbar-thin w-full ring-offset-background"
                                    {...register(field.id)}
                                />
                                <div className="absolute top-6 right-6 opacity-5 group-hover/field:opacity-10 transition-opacity pointer-events-none">
                                    <Layers className="h-8 w-8" />
                                </div>
                            </div>
                        ) : field.type === "select" ? (
                            <Controller
                                name={field.id}
                                control={control}
                                render={({ field: selectField }) => {
                                    const [searchQuery, setSearchQuery] = React.useState("");
                                    const filteredOptions = field.options?.filter(opt =>
                                        opt.toLowerCase().includes(searchQuery.toLowerCase())
                                    ) || [];

                                    return (
                                        <Select onValueChange={selectField.onChange} defaultValue={selectField.value as string}>
                                            <SelectTrigger className={cn(
                                                "w-full bg-surface/40 border-border/40 rounded-[1.2rem] !h-[60px] flex items-center justify-between font-medium px-6 hover:bg-surface/60 group/select transition-all ring-offset-background focus:ring-2 focus:ring-primary/20 relative overflow-hidden text-left shadow-sm",
                                                (selectField.value as string) && "border-primary/30 bg-primary/5 shadow-[inset_0_0_15px_rgba(var(--primary),0.05)]"
                                            )}>
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/select:opacity-100 transition-opacity" />
                                                <div className="flex items-center gap-3 z-10 overflow-hidden w-full">
                                                    {(selectField.value as string) ? (
                                                        <>
                                                            <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),1)] animate-pulse shrink-0" />
                                                            <span className="text-sm font-black uppercase tracking-tight text-foreground truncate">
                                                                {selectField.value as string}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground/30 italic text-sm truncate">{field.placeholder || "Select protocol node..."}</span>
                                                    )}
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="w-[320px] bg-surface/98 backdrop-blur-3xl border border-primary/20 rounded-[1.5rem] p-1 shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
                                                <div className="px-3 py-2 border-b border-border/30 mb-1 flex items-center justify-between">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Registry Access</p>
                                                    {(selectField.value as string) && (
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                                                    )}
                                                </div>

                                                {field.options && field.options.length > 6 && (
                                                    <div className="px-2 py-2 border-b border-border/20 mb-1">
                                                        <div className="relative group/search">
                                                            <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-focus-within/search:opacity-100 transition-opacity" />
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50 group-focus-within/search:text-primary transition-colors" />
                                                            <input
                                                                className="w-full bg-background/50 border border-border/30 rounded-lg py-2 pl-8 pr-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/40 transition-all placeholder:text-muted-foreground/30 font-sans"
                                                                placeholder="Search registry..."
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                onKeyDown={(e) => e.stopPropagation()}
                                                            />
                                                            {searchQuery && (
                                                                <div className="absolute bottom-0 left-0 h-[1px] bg-primary animate-scan w-full" />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="custom-scrollbar max-h-[280px] overflow-y-auto p-1">
                                                    {filteredOptions.length > 0 ? (
                                                        filteredOptions.map((option) => (
                                                            <SelectItem
                                                                key={option}
                                                                value={option}
                                                                className="text-xs font-bold font-sans rounded-xl py-3 px-3 focus:bg-primary/10 data-[state=checked]:bg-primary/5 transition-all cursor-pointer relative group/item mb-0.5"
                                                            >
                                                                <div className="flex items-center justify-between w-full">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary/20 group-focus:bg-primary/60 group-data-[state=checked]:bg-primary transition-colors" />
                                                                        <span className="group-data-[state=checked]:text-primary">{option}</span>
                                                                    </div>
                                                                    <Check className="h-3.5 w-3.5 opacity-0 group-data-[state=checked]:opacity-100 text-primary transition-all scale-50 group-data-[state=checked]:scale-100" />
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="py-8 text-center space-y-2 opacity-30">
                                                            <Search className="h-8 w-8 mx-auto mb-2" />
                                                            <p className="text-[10px] font-black uppercase tracking-widest">No Matches Found</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </SelectContent>
                                        </Select>
                                    );
                                }}
                            />
                        ) : field.type === "multiselect" ? (
                            <Controller
                                name={field.id}
                                control={control}
                                defaultValue={[]}
                                render={({ field: multiField }) => {
                                    const selectedValues = (multiField.value as string[]) || [];
                                    const [searchQuery, setSearchQuery] = React.useState("");

                                    const toggleValue = (val: string) => {
                                        const newVal = selectedValues.includes(val)
                                            ? selectedValues.filter(v => v !== val)
                                            : [...selectedValues, val];
                                        multiField.onChange(newVal);
                                    };

                                    const filteredOptions = field.options?.filter(opt =>
                                        opt.toLowerCase().includes(searchQuery.toLowerCase())
                                    ) || [];

                                    return (
                                        <div className="relative group/multiselect">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full bg-surface/40 border-border/40 rounded-[1.2rem] min-h-[60px] !h-auto flex items-center justify-between font-medium px-6 py-1.5 hover:bg-surface/60 group/select transition-all ring-offset-background focus:ring-2 focus:ring-primary/20 relative overflow-hidden text-left shadow-sm",
                                                            selectedValues.length > 0 && "border-primary/30 bg-primary/5 shadow-[inset_0_0_15px_rgba(var(--primary),0.05)]"
                                                        )}
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/select:opacity-100 transition-opacity" />
                                                        <div className="flex flex-wrap items-center gap-2 z-10 overflow-hidden w-full pr-8">
                                                            {selectedValues.length === 0 ? (
                                                                <span className="text-muted-foreground/30 italic text-sm truncate">{field.placeholder || "Synchronize multiple nodes..."}</span>
                                                            ) : (
                                                                selectedValues.map(val => (
                                                                    <Badge
                                                                        key={val}
                                                                        className="bg-primary/20 text-primary border-primary/30 rounded-lg py-1 px-2.5 flex items-center gap-2 animate-in zoom-in-95 duration-200 group-hover/select:bg-primary/30 transition-colors shadow-sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toggleValue(val);
                                                                        }}
                                                                    >
                                                                        <span className="text-[10px] font-black uppercase tracking-tight">{val}</span>
                                                                        <X className="h-2.5 w-2.5 opacity-60 hover:opacity-100 transition-opacity" />
                                                                    </Badge>
                                                                ))
                                                            )}
                                                        </div>
                                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                                                            {selectedValues.length > 1 && (
                                                                <div
                                                                    className="h-6 w-6 rounded-md flex items-center justify-center hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-all group/clear-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); multiField.onChange([]);
                                                                    }}
                                                                >
                                                                    <X className="h-3 w-3 group-hover/clear-btn:rotate-90 transition-transform" />
                                                                </div>
                                                            )}
                                                            <ChevronDown className="h-4 w-4 opacity-50 group-hover/select:opacity-100 transition-opacity" />
                                                        </div>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-[320px] bg-surface/98 backdrop-blur-3xl border border-primary/20 rounded-[1.5rem] p-1 shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-300">
                                                    <div className="px-3 py-2 border-b border-border/30 mb-1 flex items-center justify-between">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Node Registry</p>
                                                        {selectedValues.length > 0 && (
                                                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                                                        )}
                                                    </div>

                                                    {field.options && field.options.length > 6 && (
                                                        <div className="px-2 py-2 border-b border-border/20 mb-1">
                                                            <div className="relative group/search">
                                                                <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-focus-within/search:opacity-100 transition-opacity" />
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/50 group-focus-within/search:text-primary transition-colors" />
                                                                <input
                                                                    className="w-full bg-background/50 border border-border/30 rounded-lg py-2 pl-8 pr-3 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/40 transition-all placeholder:text-muted-foreground/30 font-sans"
                                                                    placeholder="Search registry..."
                                                                    value={searchQuery}
                                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                                    onKeyDown={(e) => e.stopPropagation()}
                                                                />
                                                                {searchQuery && (
                                                                    <div className="absolute bottom-0 left-0 h-[1px] bg-primary animate-scan w-full" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="custom-scrollbar max-h-[280px] overflow-y-auto p-1">
                                                        {filteredOptions.length > 0 ? (
                                                            filteredOptions.map((option) => {
                                                                const isSelected = selectedValues.includes(option);
                                                                return (
                                                                    <DropdownMenuCheckboxItem
                                                                        key={option}
                                                                        checked={isSelected}
                                                                        onCheckedChange={() => toggleValue(option)}
                                                                        onSelect={(e) => e.preventDefault()}
                                                                        className={cn(
                                                                            "text-xs font-bold font-sans rounded-xl py-3 px-3 transition-all cursor-pointer mb-0.5 relative group/item",
                                                                            isSelected ? "bg-primary/5 text-primary" : "hover:bg-primary/5"
                                                                        )}
                                                                    >
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <div className="flex items-center gap-2">
                                                                                <div className={cn("h-1.5 w-1.5 rounded-full transition-colors", isSelected ? "bg-primary animate-pulse" : "bg-primary/20 group-hover:bg-primary/40")} />
                                                                                <span>{option}</span>
                                                                            </div>
                                                                            {isSelected && <Check className="h-3.5 w-3.5 text-primary animate-in zoom-in-50 duration-300" />}
                                                                        </div>
                                                                    </DropdownMenuCheckboxItem>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="py-8 text-center space-y-2 opacity-30">
                                                                <Search className="h-8 w-8 mx-auto mb-2" />
                                                                <p className="text-[10px] font-black uppercase tracking-widest">No Matches Found</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    );
                                }}
                            />
                        ) : field.type === "checkbox" ? (
                            <div className="flex items-center space-x-5 p-5 bg-surface/30 border border-border/40 rounded-[1.2rem] transition-all hover:bg-surface/50 hover:border-border/60 cursor-pointer">
                                <Controller
                                    name={field.id}
                                    control={control}
                                    render={({ field: checkboxField }) => (
                                        <Checkbox
                                            id={field.id}
                                            checked={checkboxField.value as boolean}
                                            onCheckedChange={checkboxField.onChange}
                                            className="h-6 w-6 rounded-lg border-border/50 data-[state=checked]:bg-primary transition-all shadow-sm"
                                        />
                                    )}
                                />
                                <Label htmlFor={field.id} className="text-xs font-bold text-muted-foreground italic leading-none cursor-pointer">
                                    {field.placeholder || "Confirm compliance with protocol standards"}
                                </Label>
                            </div>
                        ) : (field.type === "document" || field.type === "image") ? (
                            <div className="relative group/upload">
                                <Input
                                    id={field.id}
                                    type="file"
                                    accept={field.type === "image" ? "image/*" : ".pdf,.doc,.docx,.zip"}
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            toast.info(`${field.type.toUpperCase()} cataloged: ${file.name}`);
                                        }
                                    }}
                                />
                                <Label
                                    htmlFor={field.id}
                                    className="flex flex-col items-center justify-center w-full h-40 bg-surface/30 border-2 border-dashed border-border/30 rounded-[2.5rem] cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 group/label overflow-hidden relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover/label:opacity-100 transition-opacity" />
                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="mb-3 p-3 rounded-2xl bg-background/50 border border-border/50 group-hover/label:scale-110 group-hover/label:border-primary/40 transition-all duration-500 shadow-sm">
                                            {field.type === "image" ? <ImageIcon className="h-6 w-6 text-primary/60" /> : <FileUp className="h-6 w-6 text-indigo-400/60" />}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-black uppercase tracking-widest text-foreground/80">Upload {field.type} Matrix</p>
                                            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">{field.placeholder || "Click to browse or drag and drop"}</p>
                                        </div>
                                    </div>
                                </Label>
                            </div>
                        ) : (
                            <div className="relative">
                                <Input
                                    id={field.id}
                                    type={
                                        field.type === "number" ? "number" :
                                            field.type === "phone" ? "tel" :
                                                field.type === "email" ? "email" :
                                                    field.type === "date" ? "date" :
                                                        field.type === "time" ? "time" :
                                                            field.type === "datetime" ? "datetime-local" :
                                                                "text"
                                    }
                                    placeholder={field.placeholder || (
                                        field.type === "email" ? "identification@node.global" :
                                            field.type === "phone" ? "+1 (000) 000-0000" :
                                                field.type === "number" ? "0.00" :
                                                    field.type === "date" ? "YYYY-MM-DD" :
                                                        field.type === "time" ? "HH:MM" :
                                                            field.type === "datetime" ? "YYYY-MM-DD HH:MM" :
                                                                "Enter protocol entry..."
                                    )}
                                    className="bg-surface/40 border-border/40 rounded-[1.2rem] h-[60px] text-sm focus:ring-primary/20 focus:border-primary/30 transition-all font-medium px-6 placeholder:italic placeholder:text-muted-foreground/30 shadow-sm w-full ring-offset-background appearance-none"
                                    {...register(field.id)}
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/field:opacity-40 transition-opacity pointer-events-none">
                                    {getFieldIcon(field.type)}
                                </div>
                            </div>
                        )}

                        {errors[field.id] && (
                            <div className="flex items-center gap-2 px-1 py-1 animate-in slide-in-from-left-2 duration-300">
                                <AlertCircle className="h-3 w-3 text-rose-500" />
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none">
                                    ! DISRUPTION: {errors[field.id]?.message as string}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {!hideSubmit && (
                <div className="pt-6">
                    <Button type="submit" className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.3em] text-xs rounded-[2rem] shadow-2xl shadow-primary/30 group transition-all relative overflow-hidden" disabled={isSubmitting}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        {isSubmitting ? (
                            <div className="flex items-center gap-4">
                                <div className="h-5 w-5 border-3 border-t-transparent border-white/40 rounded-full animate-spin" />
                                <span className="animate-pulse">TRANSMITTING...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                TRANSMIT PROTOCOL
                                <div className="p-2 bg-white/10 rounded-xl group-hover:translate-x-1.5 transition-all duration-300 shadow-sm group-hover:bg-white/20">
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </div>
                        )}
                    </Button>
                </div>
            )}
        </form>
    );
}
