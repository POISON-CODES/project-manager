# DELETE /stories/:id

Delete a user story.

## Details
- **Description**: Permanently removes a user story and its associated tasks.
- **Authentication**: JWT Required (ADMIN, PROJECT_LEAD).
- **Parameters**: 
    - `id`: Story UUID.

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "message": "Story deleted"
}
```
