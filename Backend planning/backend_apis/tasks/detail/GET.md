# GET /tasks/:id

Get task details.

## Details
- **Description**: Returns detailed info for a task, including dependencies (blockedBy) and assignments.
- **Authentication**: JWT Restricted.
- **Parameters**: 
    - `id`: Task UUID.

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "status": "enum",
    "assignee": { ... },
    "blockedBy": [ ... ],
    "comments": [ ... ]
  }
}
```
