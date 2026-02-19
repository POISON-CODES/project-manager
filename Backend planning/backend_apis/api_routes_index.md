# API Routes Index

Welcome to the NexusFlow API Documentation. This directory provides a structured breakdown of all backend endpoints.

## Auth
- [Sync User](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/auth/sync/POST.md)

## Users
- [List Users / Me](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/users/GET.md)
- [Update User (Admin)](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/users/PATCH.md)

> **Authentication Note**: All routes (except designated public forms) require a valid Supabase JWT. Controllers use Class-level `@UseGuards(JwtAuthGuard)` for consistent security.

## Projects
- [Create Project](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/projects/POST.md)
- [List Projects](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/projects/GET.md)
- [Timeline Hierarchy](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/projects/timeline/GET.md)
- [Get Project](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/projects/detail/GET.md)
- [Update Project](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/projects/detail/PATCH.md)
- [Delete Project](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/projects/detail/DELETE.md)
- [Claim Project](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/projects/detail/claim/PATCH.md)
- [Update Stage](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/projects/detail/stage/PATCH.md)
- [Create Story (Project Context)](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/projects/detail/stories/POST.md)

## User Stories
- [Get Story](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/stories/detail/GET.md)
- [Update Story](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/stories/detail/PATCH.md)
- [Delete Story](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/stories/detail/DELETE.md)
- [Create Task (Story Context)](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/stories/detail/tasks/POST.md)

## Tasks
- [List Tasks (Filtered)](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/tasks/GET.md)
- [Get Task](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/tasks/detail/GET.md)
- [Update Task](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/tasks/detail/PATCH.md)
- [Task Comments](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/tasks/detail/comments/POST.md)
- [Assign Task](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/tasks/detail/assign/PATCH.md)
- [Add Dependency](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/tasks/detail/dependencies/POST.md)
- [Delete Task](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/tasks/detail/DELETE.md)

## Forms
- [Create Form Template](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/forms/POST.md)
- [List Forms](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/forms/GET.md)
- [Get Form](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/forms/detail/GET.md)
- [Get Public Form](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/forms/detail/public/GET.md)

## Workflows
- [Create Workflow](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/workflows/POST.md)
- [List Workflows](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/workflows/GET.md)

## Admin
- [Kanban Stages](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/Backend%20planning/backend_apis/admin/stages/GET.md)

---

## Developer Guides
- **[Testing Suite](file:///c:/Users/Quicksell%20Work/Desktop/project%20manager/backend/TESTING.md)**: How to run unit, integration, and E2E tests.
- **Security**: Class-level `@UseGuards(JwtAuthGuard)` is enforced across all controllers.
