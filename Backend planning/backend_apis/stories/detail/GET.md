# GET /stories/:id

Find a user story by ID.

## Details
- **Description**: Retrieves detailed information about a user story, including its associated tasks.
- **Authentication**: JWT Restricted (future implementation).
- **Parameters**:
    - `id`: Story UUID.

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "projectId": "uuid",
    "tasks": [ ... ]
  }
}
```
