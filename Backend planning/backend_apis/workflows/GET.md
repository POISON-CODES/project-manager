# GET /workflows

List all automated workflows.

## Details
- **Description**: Retrieves all configured automation rules.
- **Authentication**: JWT Required (ADMIN, PROJECT_LEAD).

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "string", "triggerType": "enum", "actions": [ ... ] }
  ]
}
```
