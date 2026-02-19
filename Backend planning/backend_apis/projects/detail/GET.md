# GET /projects/:id

Get project details.

## Details
- **Description**: Retrieves full details of a specific project, including its owner and associated components.
- **Authentication**: JWT Required (MEMBER, PROJECT_LEAD, ADMIN).
- **Parameters**: 
    - `id`: Project UUID.

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "status": "enum",
    "owner": { "id": "uuid", "name": "string" },
    "createdAt": "timestamp"
  }
}
```
