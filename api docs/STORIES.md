# User Stories API Documentation

## Base URL
`/stories`

## Endpoints

### 1. Get Story Details
Fetches specific user story data.

- **URL:** `/:id`
- **Method:** `GET`
- **URL Params:** `id=[uuid]`
- **Auth Required:** Yes (JWT)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": { ...storyDetails } }`

---

### 2. Update Story
Updates story fields (title, priority, etc.).

- **URL:** `/:id`
- **Method:** `PATCH`
- **URL Params:** `id=[uuid]`
- **Request Body:**
  ```json
  {
    "title": "New Title",
    "priority": "LOW"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": { ...updatedStory } }`

---

### 3. Create Task for Story
Adds a new task to a specific user story.

- **URL:** `/:id/tasks`
- **Method:** `POST`
- **URL Params:** `id=[uuid]`
- **Request Body:**
  ```json
  {
    "title": "Implement API",
    "description": "...",
    "priority": "HIGH"
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** `{ "success": true, "data": { ...createdTask } }`

---

### 4. Delete Story
Removes the user story.

- **URL:** `/:id`
- **Method:** `DELETE`
- **URL Params:** `id=[uuid]`
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": { ...deletedStatus } }`
