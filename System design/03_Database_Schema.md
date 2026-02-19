# 03. Database Schema Deep Dive

**Role:** Data Engineer
**Format:** Prisma Schema Language (SDL)
**Database:** Supabase (PostgreSQL)

This document defines the exact database structure. We use **Prisma** as the Source of Truth.

---

## 1. Core Principles
1.  **UUIDs Everywhere:** All Primary Keys use `uuid()` to ensure portability and security.
2.  **Soft Deletes:** `deletedAt` columns on critical entities (Project, Task) to prevent accidental data loss.
3.  **JSONB for Flexibility:** Form data and Workflow configs are stored as specific JSON structures to allow schema-less evolution for those parts.

---

## 2. Prisma Schema Definition

```prisma
// --------------------------------------------------------
// DATASOURCE & GENERATOR
// --------------------------------------------------------
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// --------------------------------------------------------
// IAM MODULE (Synced with Supabase Auth or Standalone)
// --------------------------------------------------------
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String   // Mandatory
  phoneNumber String @unique
  avatarUrl String?
  role      UserRole @default(MEMBER) // RBAC

  // Relations
  ownedProjects Project[] @relation("ProjectOwner")
  assignedTasks Task[]    @relation("TaskAssignee")
  uploadedDocs  Document[]
  comments      Comment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

// ... (Rest of UserRole enum)

// --------------------------------------------------------
// PROJECT CORE MODULE
// --------------------------------------------------------
model Project {
  id          String        @id @default(uuid())
  name        String
  description String?
  status      ProjectStatus @default(PLANNING)
  
  // Ownership
  ownerId String
  owner   User   @relation("ProjectOwner", fields: [ownerId], references: [id])

  // Form Data (The content submitted via intake)
  formTemplateId String
  formTemplate   FormTemplate @relation(fields: [formTemplateId], references: [id])
  formData       Json         // validated against template schema

  // Active Stage Tracking (Workflow state)
  currentStageId String? 
  
  // Hierarchy
  stories   UserStory[]
  documents Document[] 
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? // Soft Delete

  @@index([ownerId])
  @@index([status])
  @@map("projects")
}

// ... (UserStory Model)

// ... (Task Model)

model Document {
  id        String       @id @default(uuid())
  name      String
  url       String       // S3/Supabase Storage URL
  type      DocumentType @default(GENERAL)
  
  projectId String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  uploaderId String
  uploader   User   @relation(fields: [uploaderId], references: [id])

  createdAt DateTime @default(now())
  
  @@index([projectId])
  @@map("documents")
}

// ... (Rest of the file)

enum DocumentType {
  GENERAL
  REQ_DOC
  HANDOVER_PACKAGE // Auto-generated later
}

model UserStory {
  id          String      @id @default(uuid())
  title       String
  description String?
  status      StoryStatus @default(BACKLOG)
  
  projectId String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  tasks Task[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("user_stories")
}

model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  priority    Priority   @default(MEDIUM)
  dueDate     DateTime?

  storyId String
  story   UserStory @relation(fields: [storyId], references: [id], onDelete: Cascade)

  // Assignments
  assigneeId String?
  assignee   User?   @relation("TaskAssignee", fields: [assigneeId], references: [id])

  // Dependency System (Self-Referencing Many-to-Many)
  blockedBy   Task[] @relation("TaskDependencies")
  blocking    Task[] @relation("TaskDependencies")

  comments Comment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([storyId])
  @@index([assigneeId])
  @@map("tasks")
}

// --------------------------------------------------------
// INTAKE FORMS
// --------------------------------------------------------
model FormTemplate {
  id        String   @id @default(uuid())
  name      String
  version   Int      @default(1)
  schema    Json     // Zod schema definition for validation
  isActive  Boolean  @default(true)
  
  projects  Project[]

  @@map("form_templates")
}

// --------------------------------------------------------
// WORKFLOW ENGINE (Automation)
// --------------------------------------------------------
model Workflow {
  id          String   @id @default(uuid())
  name        String
  isActive    Boolean  @default(true)
  description String?
  
  // Trigger Configuration
  triggerType String // e.g., "TASK_COMPLETED", "PROJECT_CREATED"
  triggerConfig Json? // Filtering rules (e.g., "only for Form A")

  // Actions to execute
  actions WorkflowAction[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("workflows")
}

model WorkflowAction {
  id         String   @id @default(uuid())
  workflowId String
  workflow   Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  
  order      Int      // Execution sequence
  type       String   // "HTTP_REQUEST", "EMAIL", "SLACK"
  config     Json     // URL, Method, Body Template
  
  createdAt DateTime @default(now())

  @@map("workflow_actions")
}

model ActionLog {
  id        String   @id @default(uuid())
  actionId  String
  status    LogStatus // SUCCESS, FAILED, RETRYING
  details   Json?     // Response body or Error trace
  
  executedAt DateTime @default(now())
  
  @@index([status])
  @@map("action_logs")
}

// --------------------------------------------------------
// ENUMS
// --------------------------------------------------------
enum ProjectStatus {
  PLANNING
  ACTIVE
  ON_HOLD
  COMPLETED
  ARCHIVED
}

enum StoryStatus {
  BACKLOG
  READY
  IN_PROGRESS
  DONE
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
  HALTED // Calculated state, but can be persisted for query speed
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum LogStatus {
  SUCCESS
  FAILED
  RETRYING
  PERMANENT_FAILURE
}
```

---

## 3. High-Performance Indexing Strategy
To ensure the **"Timeline Breach"** worker is efficient:
1.  `@@index([status])` on Projects and Tasks: Allows the worker to quickly find "Active" items to check against deadlines.
2.  `@@index([assigneeId])`: Optimizes the "My Tasks" dashboard query.

## 4. The "Halted" Logic
*   **Database:** We relate Tasks to Tasks (`TaskDependencies`).
*   **Application Logic:**
    *   A Task is implicitly `HALTED` if `count(blockedBy where status != DONE) > 0`.
    *   *Optimization:* We **can** store a `isHalted` boolean on the Task model and update it via Event Listeners whenever a dependency triggers `task.completed`. This effectively "caches" the halted state for read performance.

---

## Action Item
Please review the Database Schema.
**Particular Question:** Do you approve storing `formSchema` and `triggerConfig` as `JSONB`? This gives us NoSQL-like flexibility for the Form Builder within the strict SQL schema.
