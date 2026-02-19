# GET /admin/stages

Get configuration for Kanban board columns.

## Details
- **Description**: Returns the list of stages (statuses) available for the workspace boards, including labels and UI colors.
- **Authentication**: JWT Required (ADMIN, PROJECT_LEAD).

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    { "id": "TODO", "label": "To Do", "color": "#64748b" },
    { "id": "IN_PROGRESS", "label": "In Progress", "color": "#3b82f6" },
    ...
  ]
}
```
