# PATCH /users/:id/status

Update a user's status.

## Details
- **Description**: Allows an administrator to update a user's active status.
- **Authentication**: JWT Required (ADMIN).
- **Body**:
```json
{
  "status": "string"
}
```

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": { ... updated user ... }
}
```

# PATCH /users/:id/role

Update a user's role.

## Details
- **Description**: Allows an administrator to change a user's permission level.
- **Authentication**: JWT Required (ADMIN).
- **Body**:
```json
{
  "role": "ADMIN | PROJECT_LEAD | MEMBER | STAKEHOLDER"
}
```

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": { ... updated user ... }
}
```
