# 07. Feature Specifications & Requirements

**Role:** Product Owner / Tech Lead
**Source:** PRD v1.5.0

This document translates the high-level PRD into granular **Functional Requirements** for the development team. Each feature is broken down into **Logic** and **UI Standards**.

---

## 1. Core Feature: Project Management hierarchy
**Goal:** Manage the `Project -> Story -> Task` structure strictly.

### 1.1 Project Structure
*   **Requirement:** A Project MUST belong to exactly one User (The Lead).
*   **Logic:**
    *   `Project` has many `UserStories`.
    *   `UserStory` has many `Tasks`.
    *   A `Task` CANNOT exist without a `UserStory`.
*   **Constraint:** "Orphaned" tasks are not allowed.

### 1.2 The "Halted" Dependency Logic
**Goal:** Visually block work that cannot be started.
*   **Definition:** A Task is `HALTED` if it has at least one dependency (LinkType: `BLOCKED_BY`) where `status != DONE`.
*   **Backend Logic:**
    *   On `Task.updateStatus(DONE)`: Trigger event `task.completed`.
    *   Event Handler: Find all tasks blocked by this task IDs. Re-evaluate their status.
*   **Frontend UI:**
    *   **Striped Red Background** (CSS: `repeating-linear-gradient(...)`).
    *   **Dragging Disabled** in Kanban.
    *   **Banner:** "Blocked by [Task-123]: [Title]" displayed prominently.

---

## 2. Core Feature: Dynamic Intake Forms
**Goal:** Allow Admins to create custom forms (like Typeform) for new projects.

### 2.1 Form Builder (Admin)
*   **Input Types:** Text, Number, Date, Select, Multi-Select.
*   **Storage:** Stored as JSON Schema in `FormTemplate.schema`.
*   **Versioning:** Editing a form creates a NEW version (v2). Old projects keep v1 data.

### 2.2 Project Submission (Stakeholder)
*   **Access:** Direct Link or Dashboard button.
*   **Validation:** Dynamic Zod schema generation based on the Template JSON.
*   **Action:** Submission creates a `Project` in `PLANNING` status.

---

## 3. Core Feature: Automation Workflow Engine
**Goal:** "If X happens, then do Y."

### 3.1 Trigger Events
The system must emit these events for the Engine to listen to:
1.  `PROJECT_CREATED`
2.  `PROJECT_CLAIMED` (Lead assigned)
3.  `TASK_COMPLETED`
4.  `TIMELINE_BREACH` (Due Date < Now AND Status != Done)

### 3.2 Actions & Reliability
*   **Retry Policy:** If an action (e.g., Webhook) fails, it must be retried with **Exponential Backoff** up to 5 days.
*   **Implementation:** Use BullMQ `backoff` strategy.
*   **Alert:** On "Permanent Failure", create a System Task for the Admin.

---

## 4. Core Feature: User Story Completion Guard
**Goal:** Prevent premature closure of stories.

### 4.1 The "Last Task" Check
*   **Trigger:** When a user attempts to move the **Last Open Task** of a generic Story to "Done".
*   **UI Interaction:**
    1.  **Intercept** the drop action.
    2.  **Modal:** "This is the last task. Is the Story complete?"
        *   [Yes, Close Story] -> Sets Story Status to `DONE`.
        *   [No, Add More Work] -> Opens "Create Task" modal.
    3.  **Cancel/Click Outside:** Revert the drag action (Task returns to In Progress).

---

## 5. View Specifications

### 5.1 Global Gantt Chart
*   **User:** Project Lead.
*   **Data:**
    *   Row 1: "Unassigned Pool" (Projects with no owner).
    *   Row 2+: Lead's existing projects.
*   **Interaction:** Drag from Pool -> Timeline = `claimProject()`.

### 5.2 My Tasks (Dashboard)
*   **User:** Team Member.
*   **Filter:** `assigneeId == me` AND `status != DONE`.
*   **Sort:** Priority (High first), then Due Date.

---

---

## 6. Core Feature: Role-Based Access Control (RBAC)
**Goal:** strict enforcement of user scope.

### 6.1 Role Definitions
*   **Admin:** Full access. Can create Forms, Workflows, and map Stages.
*   **Project Lead:** READ/WRITE on specific **Assigned Projects**. CANNOT see other leads' active projects unless explicitly added.
    *   *Constraint:* Single Lead per Project.
*   **Team Member:** READ/WRITE on **Assigned Tasks**. READ on System-wide Projects (if Public).
*   **Stakeholder:** VIEW ONLY. Can Submit Forms.

### 6.2 Permission Matrix
| Feature | Admin | Lead | Member | Stakeholder |
| :--- | :--- | :--- | :--- | :--- |
| Global Settings | ✅ | ❌ | ❌ | ❌ |
| Create Project | ✅ | ✅ | ❌ | ✅ (Via Form) |
| Claim Project | ✅ | ✅ | ❌ | ❌ |
| Edit Task | ✅ | ✅ | ✅ (Assigned) | ❌ |
| View Gantt | ✅ | ✅ | ❌ | ❌ |

---

## 7. Core Feature: Configurable Stage Mapping
**Goal:** Admins define *logic*, not just names.

### 7.1 The Stage Mapper UI
*   **Event:** "Project Claimed" -> **Action:** Move to Stage [ Dropdown: Planning ].
*   **Event:** "Triage Complete" -> **Action:** Prompt Move to Stage [ Dropdown: Active ].
*   **Event:** "All Stories Completed" -> **Action:** Move to Stage [ Dropdown: QA/Review ].
*   **Constraint:** These mappings are Global and Mandatory.

---

## 8. Enhanced Dependency Logic (Internal vs. External)
**Goal:** Handle blocks from outside the system (e.g., "Waiting on Design Vendor").

### 8.1 External Dependencies
*   **Data Model:** `Dependency { type: 'EXTERNAL', externalDescription: 'Waiting for API Key from Client' }`.
*   **UI:** Shows a "HALTED" banner with the `externalDescription`.
*   **Resolution:** Manual button "Resolve Dependency" (since the system cannot detect external events automatically).

---

## Action Item
Developers: Use this as your checklist for implementing business logic.

