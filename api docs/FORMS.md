# Forms API Documentation

## Base URL
`/forms`

## Endpoints

### 1. Create Form Template
Defines a new intake form template.

- **URL:** `/`
- **Method:** `POST`
- **Auth Required:** Yes (JWT + Role: ADMIN/PROJECT_LEAD)
- **Request Body:**
  ```json
  {
    "title": "Project Intake Form",
    "description": "Form for new project requests",
    "schema": {
      "type": "object",
      "properties": {
         "name": { "type": "string" },
         "budget": { "type": "number" }
      }
    }
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** `{ "success": true, "data": { ...createdForm } }`

---

### 2. List Forms
Lists available form templates.

- **URL:** `/`
- **Method:** `GET`
- **Auth Required:** Yes (JWT)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": [...] }`

---

### 3. Get Form Details
Fetches schema and metadata for a form template.

- **URL:** `/:id`
- **Method:** `GET`
- **URL Params:** `id=[uuid]`
- **Auth Required:** Yes (JWT)
- **Success Response:**
  - **Code:** 200
  - **Content:** Form details including schema.

---

### 4. Get Public Form Schema
Retrieves form details without requiring authentication. Useful for external intake portals.

- **URL:** `/:id/public`
- **Method:** `GET`
- **URL Params:** `id=[uuid]`
- **Auth Required:** No
- **Success Response:**
  - **Code:** 200
  - **Content:** Form details.
  ```json
  {
    "success": true,
    "data": {
      "id": "...",
      "title": "...",
      "schema": { ... }
    }
  }
  ```
