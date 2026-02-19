# GET /projects/timeline

Get complete project hierarchy for Gantt/Timeline visualizations.

## Details
- **Description**: Returns a full tree of projects -> stories -> tasks.
- **Authentication**: JWT Required.
- **Query Parameters**:
    - `userIds`: Comma-separated user UUIDs (e.g., `id1,id2`) to filter tasks.

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "stories": [
        {
          "id": "uuid",
          "title": "string",
          "tasks": [
            {
              "id": "uuid",
              "title": "string",
              "status": "enum",
              "dueDate": "ISO Date String",
              "assignee": { ... }
            }
          ]
        }
      ]
    }
  ]
}
```
