# 08. User Stories & Critical Flows

**Role:** Product Owner
**Source:** PRD v1.5.0

This document defines the **User Journeys** that developers must implement and test (E2E).

---

## 1. The "Project Claim" Journey (Project Lead)

### User Story
> "As a Project Lead, I want to find new, unassigned projects and claim them so that I can start planning work."

### Flow Steps
1.  **View Dashboard:** Lead navigates to the **Global Gantt View**.
2.  **Filter:** Selects "Unassigned Projects" filter.
3.  **Identify:** Sees a bar labeled "Q4 Marketing Blast" in the "Unassigned Pool" row.
4.  **Action:** Drags the bar onto their own timeline row.
5.  **System Response:**
    *   **Frontend:** Optimistic update (bar moves to Lead's row).
    *   **Backend:** `PATCH /projects/{id}/claim` -> Sets `ownerId = Lead.id` and `status = PLANNING`.
    *   **Automation:** Emits `PROJECT_CLAIMED`.
6.  **Verification:** A toast appears: *"You have claimed Q4 Marketing Blast."*

---

## 2. The "Blocked Task" Journey (Team Member)

### User Story
> "As a Developer, I want to know immediately if I can't start a task so I don't waste time context-switching."

### Flow Steps
1.  **Context:** Task A ("Backend API") is blocked by Task B ("S3 Bucket Setup").
2.  **View Kanban:** Member views the Sprint Board.
3.  **Visual Cue:** Task A has a **Red Striped Background** and a `HALTED` badge.
4.  **Interaction:** Member tries to drag Task A to "In Progress".
5.  **System Response:**
    *   **Frontend Check:** `if (task.isHalted)` -> Prevent Drop. Shake animation.
    *   **Tooltip:** "Blocked by: S3 Bucket Setup".
6.  **Resolution:** Another user completes Task B.
7.  **Real-time Update:** Task A's red background disappears. It is now "Ready".

---

## 3. The "Story Completion" Journey (Team Member)

### User Story
> "As a Team Member, I want to ensure we don't accidentally close a User Story if there is still scope creep/hidden work."

### Flow Steps
1.  **Context:** Story "User Authentication" has 3 tasks. 2 are Done. 1 is In Progress.
2.  **Action:** Member drags the *last* task ("Implement Login Screen") to "Done".
3.  **System Intercept:**
    *   **Backend:** Calculates `remainingTasks = 0`. Returns `requiresConfirmation: true`.
    *   **Frontend:** Shows Modal: *"This is the last task. Is 'User Authentication' complete?"*
4.  **Decision A (Yes):** User clicks "Complete Story".
    *   Story Status -> `DONE`.
    *   Confetti animation.
5.  **Decision B (No):** User clicks "No, adding more work".
    *   Story Status remains `IN_PROGRESS`.
    *   "Create Task" modal opens immediately.

---

## 4. The "Intake Form" Journey (Stakeholder)

### User Story
> "As a Stakeholder, I want to submit a request for a new 'IT Hardware' using a standard form."

### Flow Steps
1.  **Access:** User clicks a shared link `/intake/it-hardware-v1`.
2.  **Load:** System fetches `FormTemplate` schema.
3.  **Render:** Frontend renders dynamic inputs based on JSON:
    *   "Laptop Model" (Select)
    *   "Reason" (Text Area)
    *   "Urgency" (Radio)
4.  **Submit:** User clicks "Submit Request".
5.  **Validation:** Zod schema validates inputs on client & server.
6.  **Success:** Redirect to "Request Track" page. Project created in `BACKLOG`.

---

---

## 5. The "System Configuration" Journey (Admin)

### User Story
> "As an Admin, I need to prevent chaotic project states by strictly mapping system events to specific stages."

### Flow Steps
1.  **Navigate:** `Settings > Project Stages`.
2.  **Define Stage:** Admin creates a custom stage "Pre-Release QA".
3.  **Map Logic:** Admin sees a section *"Mandatory Automation"*.
    *   Trigger: `All Tasks in Story Complete`
    *   Action: `Prompt Move to Stage: [Pre-Release QA]`
4.  **Save:** Configuration is saved as `StageConfig v2`.
5.  **Effect:** Next time a Lead completes all stories, the system *knows* to suggest "Pre-Release QA".

---

## 6. The "External Block" Journey (Team Member)

### User Story
> "As a Team Member, I am blocked by a 3rd party vendor, not another internal task. I need to flag this."

### Flow Steps
1.  **Context:** Task "Integrate Payment Gateway".
2.  **Action:** Member clicks "Add Dependency" -> Selects **"External (Vendor/Client)"**.
3.  **Input:** System prompts for description. User types: *"Waiting for Stripe API Keys from Client"*.
4.  **Result:** Task is flagged `HALTED`. Banner reads: *"Blocked by External: Waiting for Stripe API..."*.
5.  **Resolution:** 3 days later, Client sends keys. Member clicks **"Mark Resolved"**. Task becomes `READY`.

---

## 7. The "Automation Failure" Alert (System > Admin)

### User Story
> "As an Admin, I need to know if our Jira Sync is broken so I can fix the integration token."

### Flow Steps
1.  **Trigger:** Usage of "Sync to Jira" action in a workflow.
2.  **Failure:** The API returns 401 Unauthorized.
3.  **System Logic:**
    *   **Retry 1-4:** Exponential backoff. Still fails.
    *   **Retry 5 (Final):** Fails.
4.  **Escalation:**
    *   System creates a **High Priority Task** in the "Admin Queue" project.
    *   Title: *"Critical Failure: Jira Sync (Workflow #88)"*.
    *   Notification: Slack Alert sent to `#dev-ops`.
5.  **Resolution:** Admin updates the Jira Token in Settings -> Resumes the workflow.

---

## Action Item
**QA Team:** Use these 7 flows as the comprehensive test suite for E2E.

