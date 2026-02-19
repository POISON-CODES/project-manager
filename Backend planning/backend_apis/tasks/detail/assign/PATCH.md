# PATCH /tasks/:id/assign

Assign a task to a user.

## Details
- **Description**: Sets the assignee for a task.
- **Authentication**: JWT Required.
- **Parameters**: 
    - `id`: Task UUID.
- **Body**:
```json
{
  "assigneeId": "uuid | null"
}
```

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": { "id": "uuid", "assigneeId": "uuid" }
}
```
