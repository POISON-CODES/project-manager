# GET /projects

List all projects.

## Details
- **Description**: Retrieves a list of all projects in the system.
- **Authentication**: None (Public access for dashboard view).
- **Endpoint Type**: Read.

## Request
- **Parameters**: None for now (future: pagination/filters).

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "status": "enum",
      "ownerId": "uuid | null",
      "createdAt": "timestamp"
    }
  ]
}
```
