# DELETE /projects/:id

Permanently delete a project.

## Details
- **Description**: Removes the project and all cascaded children (stories, tasks, etc.). **Caution: Destructive action.**
- **Authentication**: JWT Required (ADMIN).
- **Parameters**: 
    - `id`: Project UUID.

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "message": "Project deleted"
}
```
