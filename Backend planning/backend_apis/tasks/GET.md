# GET /tasks

List all tasks.

## Details
- **Description**: Returns all tasks across all stories/projects. Useful for global Kanban boards.
- **Authentication**: JWT Restricted.

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "status": "enum",
      "assignee": { "id": "uuid", "name": "string" }
    }
  ]
}
```
