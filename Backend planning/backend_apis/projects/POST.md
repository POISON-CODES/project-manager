# POST /projects

Create a new project.

## Details
- **Description**: Initializes a new project in the system. Triggers a `PROJECT_CREATED` workflow if configured.
- **Authentication**: JWT Required (`Authorization: Bearer <token>`).
- **Roles**: All authenticated users (`ADMIN`, `PROJECT_LEAD`, `MEMBER`, `STAKEHOLDER`).

## Request
- **Body**:
```json
{
  "title": "string (min 3 chars)",
  "description": "string (optional)",
  "scope": "string (optional)",
  "budget": "number (optional)",
  "deadline": "ISO-8601 string (optional)"
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
    "status": "DRAFT",
    "createdAt": "timestamp"
  }
}
```
