# API Requirements for Advanced Visualizations

The following APIs are required to support the advanced Kanban and Gantt views in the NexusFlow dashboard.

## 1. User Management
- **GET /users**: Returns a list of all users in the workspace (needed for User Filters in Kanban/Gantt).
  - Response: `Array<{ id, name, email, avatarUrl, role }>`

## 2. Advanced Filtering for Projects/Tasks
- **GET /projects/timeline**: A specialized endpoint for Gantt charts that returns project/story/task hierarchies with start/end dates.
  - Parameters: `userIds[]` (Array of UUIDs), `status`, `includeSubTasks` (Boolean).
  - Required for: Multi-user timeline rendering.

- **GET /tasks**: (Update) Ensure this endpoint supports filtering by `status` and `userIds[]` across the entire workspace for the global Tasks Kanban.

## 3. Task Conversations
- **GET /tasks/:id/comments**: Returns an ordered list of comments for a specific task.
  - Response: `Array<{ id, content, author { name, avatarUrl }, createdAt }>`
- **POST /tasks/:id/comments**: To add a new comment to a task thread.
  - Body: `{ content: string }`

## 3. Stages & Workflow Metadata
- **GET /admin/stages**: To fetch the dynamic column headers for Kanban boards if they differ by project type.

> [!NOTE]
> Until these are ready, the frontend will use mock patterns based on these proposed structures.
