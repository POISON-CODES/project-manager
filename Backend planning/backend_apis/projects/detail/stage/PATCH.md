# PATCH /projects/:id/stage

Update project stage (Status flow).

## Details
- **Description**: Moves the project through its lifecycle stages (e.g., DRAFT -> DISCOVERY -> EXECUTION).
- **Authentication**: JWT Required.
- **Parameters**:
    - `id`: Project UUID.
- **Body**:
```json
{
  "stage": "string (e.g., DISCOVERY, EXECUTION, COMPLETED)"
}
```

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "DISCOVERY"
  }
}
```
