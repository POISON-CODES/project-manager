# GET /users

List all users in the workspace.

## Details
- **Description**: Returns basic profile information for all registered users. Useful for Kanban/Gantt assignee filters.
- **Authentication**: JWT Required (`Authorization: Bearer <token>`).

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "avatarUrl": "string | null",
      "role": "ADMIN | PROJECT_LEAD | MEMBER | STAKEHOLDER"
    }
  ]
}
```

# GET /users/me

Get current authenticated user profile.

## Details
- **Description**: Returns the full user object for the authenticated user.
- **Authentication**: JWT Required (`Authorization: Bearer <token>`).

## Response
- **Success (200 OK)**:
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "...",
  ...
}
```
