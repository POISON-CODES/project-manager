# PATCH /tasks/:id

Update a task.

## Details
- **Description**: Updates task status, title, or description. Triggers `TASK_COMPLETED` workflow if status changes to `DONE`.
- **Authentication**: JWT Required.
- **Parameters**: 
    - `id`: Task UUID.
- **Body**:
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "status": "TODO | IN_PROGRESS | DONE | HALTED (optional)"
}
```

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": { ... updated task ... }
}
```
# DELETE /tasks/:id

Delete a task.

## Details
- **Description**: Permanently removes a task.
- **Authentication**: JWT Required.
- **Parameters**: 
    - `id`: Task UUID.

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "message": "Task deleted"
}
```
