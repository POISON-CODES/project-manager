# POST /stories/:id/tasks

Create a Task for a user story.

## Details
- **Description**: Adds a new task (Action item) to a specific user story.
- **Authentication**: JWT Required.
- **Parameters**: 
    - `id`: Story UUID.
- **Body**:
```json
{
  "title": "string (min 3 chars)",
  "description": "string (optional)",
  "status": "TODO | IN_PROGRESS | DONE | HALTED (optional, default TODO)"
}
```

## Response
- **Success (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "storyId": "uuid"
  }
}
```
