"use client";

import * as React from "react";
import {
    FileText,
    CheckCircle2,
    Type,
    Hash,
    Calendar,
    Mail,
    Phone,
    Image as ImageIcon,
    FileUp,
    CheckSquare,
    Layers
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SpecViewerProps {
    schema: any; // The FormTemplate.schema.fields
    data: any;   // The Project.formData
    className?: string;
}

/**
 * SpecViewer Component.
 * High-fidelity visualization of project requirements (formData) based on the protocol template.
 */
export function SpecViewer({ schema, data, className }: SpecViewerProps) {
    if (!schema || !data) return (
        <div className="flex flex-col items-center justify-center p-12 bg-surface/30 border border-border/50 rounded-[2.5rem] opacity-40 italic text-xs">
            <Layers className="h-8 w-8 mb-4 opacity-20" />
            No specification data available for this protocol.
        </div>
    );

    const fields = Array.isArray(schema)
        ? schema
        : (schema?.fields || (schema?.sections ? schema.sections.flatMap((s: any) => s.fields) : []));

    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)}>
            {fields.map((field: any, idx: number) => {
                const fieldId = field.id || field.name || `field_${idx}`;
                const value = data[fieldId];
                const isEmpty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

                if (isEmpty) return null;

                let Icon: any = Type;
                let colorClass = "text-primary";

                switch (field.type) {
                    case "number": Icon = Hash; colorClass = "text-orange-500"; break;
                    case "select": Icon = Layers; colorClass = "text-indigo-500"; break;
                    case "multiselect": Icon = CheckSquare; colorClass = "text-indigo-500"; break;
                    case "checkbox": Icon = CheckCircle2; colorClass = "text-success"; break;
                    case "email": Icon = Mail; colorClass = "text-blue-500"; break;
                    case "phone": Icon = Phone; colorClass = "text-emerald-500"; break;
                    case "image": Icon = ImageIcon; colorClass = "text-rose-500"; break;
                    case "document": Icon = FileUp; colorClass = "text-indigo-500"; break;
                    case "textarea": Icon = FileText; colorClass = "text-muted-foreground"; break;
                }

                return (
                    <Card key={fieldId} className="bg-surface/30 backdrop-blur-md border border-border/50 rounded-3xl shadow-sm hover:shadow-md transition-all overflow-hidden group">
                        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                <Icon className={cn("h-3 w-3", colorClass)} />
                                {field.label}
                            </CardTitle>
                            <Badge variant="ghost" className="text-[8px] font-black opacity-20 uppercase tracking-tighter">{field.type}</Badge>
                        </CardHeader>
                        <CardContent className="p-5 pt-0">
                            {field.type === "textarea" ? (
                                <p className="text-sm font-medium leading-relaxed italic text-foreground/80 border-l-2 border-primary/20 pl-4 py-1">
                                    "{value}"
                                </p>
                            ) : field.type === "checkbox" ? (
                                <div className="flex items-center gap-3">
                                    <Badge className={cn(
                                        "h-6 px-3 text-[10px] font-black tracking-widest",
                                        value ? "bg-success/10 text-success border-success/20" : "bg-muted/10 text-muted-foreground border-border/50"
                                    )}>
                                        {value ? "VERIFIED / TRUE" : "UNVERIFIED / FALSE"}
                                    </Badge>
                                </div>
                            ) : (field.type === "multiselect" && Array.isArray(value)) ? (
                                <div className="flex flex-wrap gap-2">
                                    {value.map((item: string) => (
                                        <Badge key={item} variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-black px-2 h-5 uppercase tracking-widest">
                                            {item}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (field.type === "image" || field.type === "document") ? (
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-background border border-border/50 flex items-center justify-center p-2 group-hover:border-primary/40 transition-colors">
                                        <Icon className={cn("h-6 w-6 opacity-30 group-hover:opacity-100 transition-opacity", colorClass)} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black truncate max-w-[150px]">{value}</p>
                                        <p className="text-[8px] font-bold text-primary uppercase tracking-widest cursor-pointer hover:underline flex items-center gap-1 group">
                                            Access Data Matrix <FileUp className="h-2 w-2 group-hover:-translate-y-0.5 transition-transform" />
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-lg font-black tracking-tight italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
                                    {value}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
