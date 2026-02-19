# POST /forms

Create a new Form Template.

## Details
- **Description**: Defines a dynamic form structure (using JSON Schema) that can be used for project intakes or external submissions.
- **Authentication**: JWT Required (ADMIN, PROJECT_LEAD).
- **Body**:
```json
{
  "title": "string (min 3 chars)",
  "description": "string (optional)",
  "schema": {
    "type": "object",
    "properties": { ... JSON Schema ... }
  }
}
```

## Response
- **Success (201 Created)**:
```json
{
  "success": true,
  "data": { "id": "uuid", "name": "title", "schema": { ... } }
}
```
