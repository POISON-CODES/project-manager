# PATCH /projects/:id

Update project basic information.

## Details
- **Description**: Updates core metadata for a project.
- **Authentication**: JWT Required.
- **Parameters**: 
    - `id`: Project UUID.
- **Body**:
```json
{
  "title": "string (min 3 chars, optional)",
  "description": "string (optional)",
  "budget": "number (optional)"
}
```

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": { ... updated data ... }
}
```
