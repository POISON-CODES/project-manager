# NexusFlow Automation Engine: Handover Package

**Version:** 1.0.0
**Reference:** PRD v1.5.0
**Target Audience:** System Architect, Database Engineer, Frontend Lead

---

## 1. Data Architecture (ERD)

The following Entity Relationship Diagram defines the core schema required to support the `Project -> User Story -> Task` hierarchy, Multi-Form Intake system, and Automation Engine.

```mermaid
erDiagram
    User ||--o{ ProjectRole : "has"
    User ||--o{ TaskAssignment : "is assigned to"
    
    %% Core Hierarchy
    Project ||--|{ UserStory : "contains"
    Project ||--o{ ProjectRole : "has members"
    Project ||--|| FormTemplate : "created via"
    
    UserStory ||--|{ Task : "contains"
    UserStory ||--o{ User : "assigned to (Lead)"
    
    Task ||--o{ TaskAssignment : "assigned to"
    Task ||--o{ Dependency : "blocked by"
    
    %% Configuration
    FormTemplate ||--|{ FormSubmission : "instances"
    StageConfig ||--|{ Project : "defines stages for"
    
    %% Automation Engine
    Workflow ||--|{ WorkflowTrigger : "listens for"
    Workflow ||--|{ WorkflowAction : "executes"
    WorkflowAction ||--o{ AuditLog : "logs execution"
    
    Project {
        uuid id pk
        string name
        uuid lead_user_id
        uuid form_template_id
        json form_data "Dynamic Intake Data"
        enum status "Active, Archived"
        uuid current_stage_id
    }
    
    UserStory {
        uuid id pk
        uuid project_id fk
        string title
        uuid assignee_id
        enum status "Backlog, In Progress, Done"
        boolean is_halted
    }
    
    Task {
        uuid id pk
        uuid story_id fk
        string title
        datetime due_date
        enum status "ToDo, Doing, Blocked, Done"
        boolean is_halted
    }
    
    Dependency {
        uuid id pk
        uuid blocker_id "Task/Story ID"
        uuid blocked_id "Task/Story ID"
        enum type "Internal, External"
        string external_description
    }
```

---

## 2. API Specification (Automation Engine)

### 2.1 Reusable Action Schema
The "Action" object is stored in the database and referenced by workflows.

```json
{
  "action_id": "act_550e8400",
  "name": "Send Slack Notification",
  "method": "POST",
  "url": "https://hooks.slack.com/services/...",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{secret_token}}" // Preserved as plain text per MVP
  },
  "body_template": {
    "text": "Task {{task.name}} was assigned to {{task.assignee.name}}."
  },
  "retry_policy": {
    "enabled": true,
    "strategy": "exponential_backoff",
    "max_days": 5
  }
}
```

### 2.2 Webhook Payload (Outgoing)
When a trigger fires, the system constructs this payload.

```json
{
  "event": "project.claimed",
  "timestamp": "2026-10-15T08:00:00Z",
  "source": {
    "id": "proj_123",
    "type": "project"
  },
  "context": {
    "project": {
      "name": "Q3 Marketing",
      "lead": "Alice Smith",
      "form_version": "v1.2"
    },
    "actor": {
      "id": "user_999",
      "email": "alice@company.com"
    }
  }
}
```

---

## 3. Logic Sequence Diagrams

### 3.1 Critical Path: User Story Completion
**Scenario:** A Team Member completes the *last* task in a User Story.

```mermaid
sequenceDiagram
    participant User
    participant UI as Frontend (Task View)
    participant API as Backend
    participant Story as User Story Service

    User->>UI: Drag Last Task to "Done"
    UI->>API: PATCH /tasks/{id}/status (Done)
    API->>Story: Check Remaining Tasks(story_id)
    Story-->>API: 0 Tasks Remaining
    API-->>UI: Response (story_complete_candidate: true)
    
    rect rgb(255, 200, 200)
    Note right of UI: SYSTEM HALT - User Input Required
    UI->>User: Show Popup: "Complete Story?"
    end

    alt Option A: Complete
        User->>UI: Click "Yes, Complete Story"
        UI->>API: PATCH /stories/{id}/status (Done)
        API-->>UI: Success (Confetti)
    else Option B: More Work
        User->>UI: Click "No, Add Task"
        UI->>User: Open "New Task" Modal
        User->>UI: Submit New Task
        UI->>API: POST /tasks (New Task)
    else Option C: Dismiss/Cancel
        User->>UI: Click "Cancel" / Click Outside
        UI->>API: PATCH /tasks/{id}/status (In Progress)
        Note right of API: Auto-Revert (Undo)
        API-->>UI: Reverted State
    end
```

### 3.2 Resilience: Workflow Failure & Retry
**Scenario:** A configured webhook fails (500 Error).

```mermaid
sequenceDiagram
    participant Worker as Job Queue
    participant Target as External API
    participant DB as Audit Log
    participant Engine as Workflow Engine

    Worker->>Target: POST /webhook (Attempt 1)
    Target-->>Worker: 500 Internal Server Error
    Worker->>DB: Log Failure (Attempt 1)
    
    loop Exponential Backoff (5 Days)
        Worker->>Worker: Wait (Backoff Time)
        Worker->>Target: Retry Request
    end
    
    Target-->>Worker: 500 Internal Server Error (Final Attempt)
    Worker->>DB: Log Permanent Failure
    
    Worker->>Engine: Trigger Event: "Workflow Action Failed"
    Engine->>Engine: Find "On Failure" Workflows
    Engine->>Worker: Enqueue "Send Admin Alert" Job
```

---

## 4. UX Implementation Specs

### 4.1 Dependency "HALTED" State
*   **Kanban Card:**
    *   **Border:** 2px Solid Red (#FF0000).
    *   **Overlay:** "HALTED" badge in top-right.
    *   **Interaction:** Drag-and-drop DISABLED.
    *   **Tooltip:** Hover shows "Blocked by: [Task Name] (Assigned to: [User])".
*   **Gantt Bar:**
    *   **Color:** Striped Red/Grey pattern.
    *   **Line:** Solid Red line to dependency.

### 4.2 Array Iterator UI (Workflow Builder)
*   **Constraint:** When a user selects a variable that is an Array (e.g., `{{task.assignees}}`), the UI **MUST** disable the "Insert Variable" button and instead show two options:
    1.  **[Iterate]:** "Run this action for each item."
    2.  **[Join]:** "Join values with 'Comma'."
*   **Purpose:** Prevents sending `[Object object]` in JSON payloads.
