# POST /tasks/:id/dependencies

Add a dependency.

## Details
- **Description**: Marks this task as blocked by another task. Re-evaluates the task status (may move it to `HALTED`).
- **Authentication**: JWT Required.
- **Parameters**: 
    - `id`: Task UUID (The blocked task).
- **Body**:
```json
{
  "dependencyId": "uuid" (The blocking task)
}
```

## Response
- **Success (201 Created)**:
```json
{
  "success": true,
  "data": { ... updated task ... }
}
```

# DELETE /tasks/:id/dependencies/:depId

Remove a dependency.

## Details
- **Description**: Removes a blocking dependency and re-evaluates the task status (may move it back to `TODO`).
- **Authentication**: JWT Required.
- **Parameters**: 
    - `id`: Task UUID.
    - `depId`: Dependency UUID.

## Response
- **Success (200 OK)**:
```json
{
  "success": true,
  "data": { ... updated task ... }
}
```
