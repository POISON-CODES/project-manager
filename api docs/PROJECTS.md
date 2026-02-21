# Projects API Documentation

## Base URL
`/projects`

## Endpoints

### 1. List All Projects
Retrieves a list of all active projects.

- **URL:** `/`
- **Method:** `GET`
- **Auth Required:** Yes (JWT)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "uuid",
          "name": "Project Name",
          "description": "...",
          "status": "INITIATED",
          "startDate": "iso-date",
          "endDate": "iso-date"
        },
        ...
      ]
    }
    ```

---

### 2. Get Project Details
Fetches full details of a specific project, including nested stats.

- **URL:** `/:id`
- **Method:** `GET`
- **URL Params:** `id=[uuid]`
- **Auth Required:** Yes (JWT)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": { ...projectDetails } }`

---

### 3. Create Project
Initializes a new project.

- **URL:** `/`
- **Method:** `POST`
- **Auth Required:** Yes (JWT)
- **Request Body:**
  ```json
  {
    "name": "Project Alpha",
    "description": "A new initiative",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-06-01T00:00:00Z",
    "budget": 50000
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** `{ "success": true, "data": { ...createdProject } }`

---

### 4. Update Project
Updates project fields.

- **URL:** `/:id`
- **Method:** `PATCH`
- **URL Params:** `id=[uuid]`
- **Auth Required:** Yes (JWT)
- **Request Body:** `{ "name": "New Name", ... }`
- **Success Response:**
  - **Code:** 200
  - **Content:** Updated project object.

---

### 5. Claim Project
Assigns the authenticated user to the project.

- **URL:** `/:id/claim`
- **Method:** `PATCH`
- **URL Params:** `id=[uuid]`
- **Auth Required:** Yes (JWT)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": { ...updatedProject } }`

---

### 6. Update Project Stage
Updates the current stage of the project.

- **URL:** `/:id/stage`
- **Method:** `PATCH`
- **URL Params:** `id=[uuid]`
- **Request Body:**
  ```json
  {
    "stage": "IN_PROGRESS"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": { ...updatedProject } }`

---

### 7. Get Project Timeline (Gantt)
Returns hierarchical data (Project -> Story -> Task) for timeline visualization.

- **URL:** `/timeline`
- **Method:** `GET`
- **Query Params:** `userIds=uuid1,uuid2` (Optional filter)
- **Auth Required:** Yes (JWT)
- **Success Response:**
  - **Code:** 200
  - **Content:** Hierarchical project tree.

---

### 8. Create User Story for Project
Adds a story directly to a project.

- **URL:** `/:id/stories`
- **Method:** `POST`
- **URL Params:** `id=[uuid]`
- **Request Body:**
  ```json
  {
    "title": "As a user, I want...",
    "priority": "HIGH"
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** `{ "success": true, "data": { ...createdStory } }`

---

### 9. Delete Project
Permanently removes a project.

- **URL:** `/:id`
- **Method:** `DELETE`
- **URL Params:** `id=[uuid]`
- **Auth Required:** Yes (JWT)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": { ...deletedStatus } }`
