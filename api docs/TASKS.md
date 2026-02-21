# Tasks API Documentation

## Base URL
`/tasks`

## Endpoints

> **Note:** Tasks are created via the User Stories API (`POST /stories/:id/tasks`).

### 1. List All Tasks
Retrieves tasks, typically for Kanban views.

- **URL:** `/`
- **Method:** `GET`
- **Query Params:**
  - `status`: Filter by `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`, `HALTED`
  - `userIds`: Comma-separated user IDs to filter by assignees.
- **Auth Required:** Yes (JWT)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": [...] }`

---

### 2. Get Task Details
Fetches specific task data.

- **URL:** `/:id`
- **Method:** `GET`
- **URL Params:** `id=[uuid]`
- **Auth Required:** Yes (JWT)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": { ...taskDetails } }`

---

### 3. Update Task
Updates generic task fields (title, description, status, etc.).

- **URL:** `/:id`
- **Method:** `PATCH`
- **URL Params:** `id=[uuid]`
- **Request Body:**
  ```json
  {
    "status": "IN_PROGRESS",
    "priority": "URGENT",
    "description": "..."
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": { ...updatedTask } }`

---

### 4. Assign Task
Assigns or unassigns a user to a task.

- **URL:** `/:id/assign`
- **Method:** `PATCH`
- **URL Params:** `id=[uuid]`
- **Request Body:**
  ```json
  {
    "assigneeId": "user-uuid" // or null to unassign
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": { ...updatedTask } }`

---

### 5. Add Task Dependency
Marks a task as blocked by another task.

- **URL:** `/:id/dependencies`
- **Method:** `POST`
- **URL Params:** `id=[uuid]`
- **Request Body:**
  ```json
  {
    "dependencyId": "blocking-task-uuid"
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** `{ "success": true, "data": { ...updatedTask } }`

---

### 6. Remove Task Dependency
Unblocks a task.

- **URL:** `/:id/dependencies/:depId`
- **Method:** `DELETE`
- **URL Params:**
  - `id`: Target task ID
  - `depId`: Blocking task ID
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": { ...updatedTask } }`

---

### 7. Get Task Comments
Fetches activity feed/comments for a task.

- **URL:** `/:id/comments`
- **Method:** `GET`
- **URL Params:** `id=[uuid]`
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": [...] }`

---

### 8. Add Task Comment
Posts a new comment to a task.

- **URL:** `/:id/comments`
- **Method:** `POST`
- **URL Params:** `id=[uuid]`
- **Request Body:**
  ```json
  {
    "content": "Updated the specs for this task."
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** `{ "success": true, "data": { ...createdComment } }`

---

### 9. Delete Task
Removes a task.

- **URL:** `/:id`
- **Method:** `DELETE`
- **URL Params:** `id=[uuid]`
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": { ...deletedStatus } }`
