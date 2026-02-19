# POST /projects/:id/stories

Create a User Story for a project.

## Details
- **Description**: Adds a new user story (Requirement/Feature) to a project.
- **Authentication**: JWT Required.
- **Parameters**: 
    - `id`: Project UUID.
- **Body**:
```json
{
  "title": "string (min 3 chars)",
  "description": "string (optional)",
  "priority": "LOW | MEDIUM | HIGH (optional, default MEDIUM)"
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
    "projectId": "uuid"
  }
}
```
