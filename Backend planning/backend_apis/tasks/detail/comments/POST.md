# GET /tasks/:id/comments

List comments for a specific task.

## Details
- **Description**: Returns a chronological list of comments for a task, including author information.
- **Authentication**: JWT Required.
- **Parameters**: 
    - `id`: Task UUID.

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "string",
      "author": { "id": "uuid", "name": "string", "avatarUrl": "string" },
      "createdAt": "ISO Date String"
    }
  ]
}
```

# POST /tasks/:id/comments

Add a comment to a task.

## Details
- **Description**: Posts a new comment to the task thread.
- **Authentication**: JWT Required.
- **Parameters**: 
    - `id`: Task UUID.
- **Body**:
```json
{
  "content": "string (min 1 char)"
}
```

## Response
- **Success (201 Created)**:
```json
{
  "success": true,
  "data": { ... created comment ... }
}
```
