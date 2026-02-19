# API Requirements for NexusFlow v2.0

## Status: REVISED (2024-02-20)
All previous requirements for Advanced Visualizations (v1.0) have been satisfied and merged into the main API Routes Index.

---

## 🚀 New Requirements (v2.0)

### 1. User Presence & Activity
- **GET /users/activity**: Returns a stream or list of recent activities for specific users.
  - Required for: Dashboard "Recent Activity" feed.
- **PATCH /users/me/profile**: Allow users to update their own avatar and display name (distinct from Supabase metadata).

### 2. Manual Synchronization
- **POST /auth/sync/manual**: A triggered version of the sync logic for cases where the Supabase webhook failed or was delayed.
  - Required for: Onboarding troubleshooting.

### 3. Advanced Search
- **GET /search/global**: A unified search endpoint that queries Projects, Stories, and Tasks by title/description.
  - Required for: Command Palette / Global Search bar.

### 4. Role-Based Access Control (RBAC) Fine-tuning
- **GET /admin/permissions**: Returns the permission matrix for current user roles.
  - Required for: Dynamic UI element visibility (e.g., hiding Delete button for non-admins).

---
> [!IMPORTANT]
> Requirement v1.0 regarding Gantt/Kanban filtering is now considered CORE functionality.
