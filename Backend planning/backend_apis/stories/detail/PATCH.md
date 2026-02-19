# PATCH /stories/:id

Update a user story.

## Details
- **Description**: Updates metadata (title, description, priority) of a user story.
- **Authentication**: JWT Required.
- **Parameters**: 
    - `id`: Story UUID.
- **Body**:
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "priority": "LOW | MEDIUM | HIGH (optional)"
}
```

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": { ... updated story ... }
}
```
