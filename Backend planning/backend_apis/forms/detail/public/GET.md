# GET /forms/:id/public

Get public form template schema.

## Details
- **Description**: Unauthenticated endpoint to retrieve only active form schemas for external submissions (e.g., project intake).
- **Authentication**: None.
- **Parameters**: 
    - `id`: Form UUID.

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "schema": { ... }
  }
}
```
