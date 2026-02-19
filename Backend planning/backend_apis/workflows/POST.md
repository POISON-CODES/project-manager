# POST /workflows

Create a new automation rule.

## Details
- **Description**: Configures a trigger-action rule (e.g., when a task is completed, send a webhook).
- **Authentication**: JWT Required (`Authorization: Bearer <token>`). **ROLE: ADMIN or PROJECT_LEAD**.
- **Body**:
```json
{
  "triggerType": "TASK_COMPLETED | PROJECT_CREATED",
  "name": "string",
  "actions": [
    {
      "type": "HTTP_REQUEST",
      "config": {
        "url": "https://callback.url",
        "method": "POST"
      }
    }
  ]
}
```

## Response
- **Success (201 Created)**:
```json
{
  "success": true,
  "data": { "id": "uuid", "name": "string", "triggerType": "enum" }
}
```
