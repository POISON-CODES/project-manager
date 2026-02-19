# Product Requirements Document (PRD): NexusFlow Automation Engine

**Version:** 1.5.0 (FINAL)
**Date:** 2026-02-18
**Status:** Approved for Handover

---

## 1. Executive Summary
**NexusFlow Automation Engine** is an enterprise-grade Project Management System (PMS) focused on **automated escalation** and **high-visibility data mapping**. It bridges the gap between human workflow and system intervention by prioritizing:
1.  **Visual Prominence:** Dependencies blocking progress are immediately flagged as **"HALTED"**.
2.  **Resilience:** Automated failure handling (5-day exponential backoff) ensures reliability.
3.  **Flexibility:** Multiple intake forms and fully configurable status stages mapped to system events.
4.  **User Guidance:** Proactive UI prompts ensure data accuracy during critical transitions.

---

## 2. User Personas & Roles (RBAC)

| Role | Responsibility | Key Interactions | Constraints |
| :--- | :--- | :--- | :--- |
| **Admin** | System configuration (Forms, Workflows, Statuses). | Full access to global settings, workflow builder, stage mapping, and API definitions. | System-wide scope. |
| **Project Lead** | Project ownership & high-level planning. | Claims projects from multiple views (List, Gantt), defines User Stories, assigns Team Members. | **Single User per Project.** |
| **Project Stakeholder** | Request initiation & passive monitoring. | Submits projects via Default Form (Dashboard) or Shared Link. View-only access. | **Single User per Project.** |
| **Team Member** | Execution of assigned work. | Completes Tasks, updates Status. | **Multiple Users per Task/Story.** |

---

## 3. Functional Requirements

### 3.1 Project Data Model & Views

#### 3.1.1 Hierarchy
*   **Structure:** `Project` -> `User Stories` -> `Tasks`
*   **Dependencies:**
    *   **Visual Flag:** Any Project, Story, or Task with an active dependency (Internal or External) must be visually flagged as **"HALTED"** (e.g., Red Banner).
    *   **Resolution:** When a dependency is cleared, the dependent item is unflagged and marked **"Ready to Resume."**

#### 3.1.2 Dynamic Forms & Versioning
*   **Multiple Intake Forms:**
    *   **Creation:** Admins create unlimited unique forms (e.g., "IT Request," "Marketing Brief").
    *   **Access:** One **Default Form** (Dashboard) vs. **Link-Only Forms**.
    *   **Lifecycle:** Forms cannot be deleted, only **Deactivated**. Deactivated links redirect to Default.
    *   **Metadata:** Projects store `Form Name` and `Version` used at submission.
*   **Versioning:** All configurations (Forms, Statuses) are versioned snapshots to protect legacy data.

### 3.2 Workflow Logic

#### 3.2.1 Configurable Stage Mapping
*   **Concept:** Admins define custom stages (e.g., "Backlog," "Development") but **must map System Events** to them.
*   **Mandatory Mappings:**
    *   *Event: Project Claimed* -> Move to Stage: [Admin Selects Stage].
    *   *Event: Triage Complete* -> Prompt Lead to move to: [Admin Selects Stage].
    *   *Event: All Stories Done* -> Prompt to move to: [Admin Selects Stage].

#### 3.2.2 Global Queue & Project Lead Views
*   **Unified Visibility:** Leads view **"Unassigned Projects"** alongside their **"My Active Projects"**.
*   **Views:** 
    *   **List View:** Standard table.
    *   **Gantt View:** Timeline visualization of capacity vs. new requests. allows Leads to claim work strategically.

#### 3.2.3 User Story Completion Logic
When a Team Member marks the **last** open Task in a Story as "Done":
1.  **System Prompt:** A UI Popup asks: *"Complete Story?"* or *"More Work Required?"*
2.  **Action:** IF "Complete" -> Close Story. IF "More Work" -> Prompt to Create Task.
3.  **Enforcement:** IF ignored/dismissed -> **Undo** the task completion (revert to "In Progress").

### 3.3 Automation & Workflow Engine (No-Code)

#### 3.3.1 Triggers & Actions
*   **Triggers:**
    *   `Project Created` (Form Filled), `Project Claimed`, `Status Changed`.
    *   `Story/Task Created`, `Assigned`, `Dependency Added/Resolved`.
    *   `Timeline Breach` (System Event).
    *   `Workflow Action Failed` (System Event).
*   **Actions:**
    *   **Reusable API Actions:** Method, URL, Headers, Body.
    *   **Array Iterator:** UI to "For Each" or "Map/Join" array fields (e.g., `{{task.assignees}}`).

#### 3.3.2 Failure Handling (Resilience)
*   **Retry Policy:** 5-Day Exponential Backoff loop for failed API calls.
*   **Escalation:** Fires `Workflow Action Failed` trigger on final failure or specific error codes.

---

## 4. Non-Functional Requirements & Constraints

### 4.1 System Performance & Reliability
*   **Concurrency:** The Workflow Engine (Triggers/Webhooks) must run asynchronously to prevent UI blocking during bulk updates (e.g., Mass Assignment).
*   **Scalability:** The "Timeline Breach" background worker must efficiently process thousands of active tasks without degradation.

### 4.2 Security
*   **API Headers:** Custom headers (e.g., Tokens) stored as plain text for MVP (per user requirement).
*   **RBAC Enforcement:** "Lead" (Single) vs "Member" (Many) logic must be strictly enforced at the API level.
*   **Data Integrity:** Configuration Versioning ensures schema changes do not corrupt historical project data.

---

## 5. Strategic Decisions (Resolved)

| Decision Point | Resolution |
| :--- | :--- |
| **Dependency Visualization** | **Strict Halt:** Visual Red Banners block progress until resolved. |
| **Retries & Failure** | **5-Day Backoff:** System retries exponentially. Failures fire a specific trigger for custom alerts. |
| **Array Variables** | **UI Iterator:** Users explicitly choose to "Iterate" or "Join" array values in the workflow builder. |
| **Legacy Compatibility** | **Snapshots:** Projects retain the Form/Status config version active at creation time. |
| **Story Completion** | **Strict Logic:** User must explicitly close the story or create more work; otherwise, the task reverts. |

---

## 6. Detailed User Experience & Stories

### 6.1 Admin: Global Configuration
**User Story:** "As an Admin, I want to create multiple intake forms and map project stages so the system enforces our process."

**UX Narrative:**
*   **View:** `Settings > Intake Forms`.
*   **Action:** Admin creates "Legal Review Form." Sets it as **Link-Only**.
*   **View:** `Settings > Project Stages`.
*   **Action:** Renames "To Do" to "Backlog."
*   **Constraint:** System prompts: *"Please select which stage a project moves to when Claimed."* Admin selects "Planning."

### 6.2 Stakeholder: Project Submission (Multi-Form)
**User Story:** "As a Stakeholder, I want to submit a request using a specific link sent to me by IT."

**UX Narrative:**
*   **Action:** User clicks email link `.../intake/form-id-123`.
*   **View:** The specific "Legal Review Form" loads.
*   **Submission:** User fills data. Real-time validation checks fields.
*   **Result:** Application confirms submission. Project Created with `Form: Legal Review v1`.

### 6.3 Project Lead: Triage & Capacity Planning
**User Story:** "As a Project Lead, I want to view unassigned projects on my Gantt chart to check if I have capacity."

**UX Narrative:**
*   **View:** `Global Timeline (Gantt)`.
*   **Filter:** "Show Unassigned" + "Show My Projects."
*   **Visual:** Lead sees their project ending in 2 weeks. An unassigned "Q3 Marketing Campaign" starts next week.
*   **Action:** They click the unassigned bar -> "Claim Project."
*   **Result:** Project moves to "Planning" stage. A `Project Claimed` webhook fires.

### 6.4 Team Member: Execution & Dependencies
**User Story:** "As a Team Member, I want to see clearly if my task is blocked so that I don't waste time."

**UX Narrative:**
*   **View:** `Kanban Board`.
*   **Visual:** Card "Develop API" has a **Red "HALTED" Banner**. Icon shows "Waiting on: Design Mockups."
*   **Action:** User cannot move card to "Done."
*   **Resolution:** When dependency clears, Banner disappears. Card updates to **"Ready to Resume"**.

### 6.5 Admin: Automation & Failure Handling
**User Story:** "As a Team Member, "As an Admin, I want to be notified if a webhook fails repeatedly so that I can fix the integration."

**UX Narrative:**
*   **Event:** Webhook fails (500 Error) on Day 5 retry.
*   **Trigger:** `Workflow Action Failed` fires.
*   **Action:** System executes pre-configured "Error Notification" workflow.
*   **Result:** Admin receives Slack alert: *"Critical Failure: Jira Sync Webhook failed 5 times for Project X."*

---

## 7. Handover Package Checklist (Next Steps)
The following artifacts will be generated for the Architecture & Design teams:

1.  **ERD (Entity Relationship Diagram):** Schema for Projects, Stories, Tasks, Forms, Dependencies, and Automation Logs.
2.  **API Spec:** Definitions for "Reusable Actions" and Webhook payloads.
3.  **UI Wireframe Specs:** Component behavior for "Halted" states, Form Builders, and the Global Gantt.
4.  **Logic Flows:** Sequence diagrams for the "Story Completion" and "Failure Retry" loops.
