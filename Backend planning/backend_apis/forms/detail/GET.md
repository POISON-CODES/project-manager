# GET /forms/:id

Get form template details.

## Details
- **Description**: Retrieves full schema and metadata for a specific form template.
- **Authentication**: JWT Required.
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
