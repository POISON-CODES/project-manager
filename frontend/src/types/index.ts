/**
 * Common status types for Projects, Stories, and Tasks.
 * These are system-level statuses that map to Admin-defined stages.
 */
export type SystemStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "HALTED";


/**
 * Priority levels for tasks and projects.
 */
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/**
 * User roles as defined in the PRD.
 */
export type UserRole = "ADMIN" | "PROJECT_LEAD" | "STAKEHOLDER" | "MEMBER";

/**
 * Simplified User object.
 */
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    phoneNumber?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
}

/**
 * Dependency object for halting logic.
 */
export interface Dependency {
    id: string;
    targetId: string; // ID of the project/story/task it depends on
    type: "INTERNAL" | "EXTERNAL";
    description: string;
    resolved: boolean;
}

/**
 * Task Entity
 */
export interface Task {
    id: string;
    storyId: string;
    story?: { id: string; title: string };
    project?: { id: string; name: string };
    title: string;
    description?: string;
    status: SystemStatus;
    priority: Priority;
    assignee?: User;
    assignees?: User[]; // Deprecated, use assignee
    blockedBy?: Task[];
    blocking?: Task[];
    isHalted: boolean;
    dependencies: Dependency[];
    dueDate?: string;
    startDate?: string;

    // Scheduling fields
    estimatedMinutes: number;
    bufferMinutes: number;
    totalMinutes: number;
    scheduledStart?: string;
    scheduledEnd?: string;

    createdAt: string;
    updatedAt: string;
}

/**
 * Calendar Event Entity
 */
export type CalendarEventType = "MEETING" | "BREAK" | "OOO" | "OTHER";

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    type: CalendarEventType;
    start: string;
    end: string;
    userId: string;
    user?: User;
    createdAt: string;
    updatedAt: string;
}

export interface UserCapacity {
    userId: string;
    scheduledMinutes: number;
    availableMinutes: number;
    capacityPercent: number;
}

/**
 * User Story Entity
 */
export interface UserStory {
    id: string;
    projectId: string;
    title: string;
    description?: string;
    status: SystemStatus;
    tasks: Task[];
    isHalted: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Project Stage Entity - Defined in DB
 */
export interface ProjectStage {
    id: string;
    name: string;
    color: string;
    order: number;
    description?: string;
    icon?: string;
}

/**
 * Project Entity - The top-level hierarchy.
 */
/**
 * Task Statistics for a project.
 */
export interface TaskStats {
    total: number;
    low: number;
    medium: number;
    high: number;
    critical: number;
}

/**
 * Project Entity - The top-level hierarchy.
 */
export interface Project {
    id: string;
    name: string;
    description: string;
    isHalted: boolean;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
    taskStats?: TaskStats;
    owner?: User;
    stakeholder?: User;
    stories?: UserStory[];
    team?: User[];

    // Stage Tracking
    currentStageId?: string;
    currentStage?: ProjectStage;

    // Additional metadata
    status?: SystemStatus;
    formData?: any;
    formTemplate?: FormTemplate;
}

/**
 * Intake Form Template definition.
 */
export interface FormField {
    id: string;
    label: string;
    type: "text" | "number" | "phone" | "email" | "document" | "image" | "select" | "multiselect" | "textarea" | "checkbox" | "date" | "time" | "datetime";
    placeholder?: string;
    helpText?: string;
    required: boolean;
    options?: string[]; // For select and multiselect type
}

export interface FormTemplate {
    id: string;
    title: string;
    description?: string;
    version: string;
    fields: FormField[];
    schema?: any; // JSON Schema or custom section-based schema
    isActive: boolean;
    isDefault: boolean;
}

/**
 * Workflow Action definition.
 */
export interface WorkflowAction {
    id: string;
    workflowId: string;
    type: "HTTP_REQUEST";
    name?: string;
    config: Record<string, any>;
    order: number;
}

/**
 * Workflow / Automation rule definition.
 */
export interface Workflow {
    id: string;
    name: string;
    description?: string;
    triggerType: "TASK_COMPLETED" | "PROJECT_CREATED" | "STORY_CREATED";
    triggerConfig: Record<string, any>;
    isActive: boolean;
    actions: WorkflowAction[];
    createdAt: string;
    updatedAt: string;
}

/**
 * Feature Flag system for granular control over application modules.
 */
export type AppFeature =
    | "DASHBOARD"
    | "CALENDAR"
    | "PROJECTS"
    | "TASKS"
    | "AUTOMATION"
    | "INTAKE"
    | "ADMIN_CONTROLS"
    | "GLOBAL_SEARCH";

export interface FeatureState {
    id: AppFeature;
    name: string;
    description: string;
    enabled: boolean;
    icon?: string;
}

/**
 * System Activity / Log entry.
 */
export interface Activity {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    entityName?: string;
    userId: string;
    user?: User;
    createdAt: string;
}
