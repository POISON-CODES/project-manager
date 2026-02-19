# PATCH /projects/:id/claim

Claim a project (Assign yourself as owner).

## Details
- **Description**: Assigns the authenticated user as the owner of the project.
- **Authentication**: JWT Required (`Authorization: Bearer <token>`).
- **Parameters**:
    - `id`: Project UUID.

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "ownerId": "uuid"
  }
}
```
