# GET /forms

List all Form Templates.

## Details
- **Description**: Retrieves all form templates defined in the system.
- **Authentication**: JWT Required.

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "string", "isActive": "boolean" }
  ]
}
```
