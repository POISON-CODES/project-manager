# Admin & Metadata API Documentation

## Base URL
`/admin`

## Endpoints

### 1. Get Kanban Stages
Returns configuration for Kanban columns/stages, including labels and colors.

- **URL:** `/stages`
- **Method:** `GET`
- **Auth Required:** Yes (JWT + Role: ADMIN/PROJECT_LEAD)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "success": true,
      "data": [
        { "id": "TODO", "label": "To Do", "color": "#64748b" },
        { "id": "IN_PROGRESS", "label": "In Progress", "color": "#3b82f6" },
        ...
      ]
    }
    ```

---

### 2. Get Role Permissions
Returns the permission matrix for the currently authenticated user's role.

- **URL:** `/permissions`
- **Method:** `GET`
- **Auth Required:** Yes (JWT)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "success": true,
      "data": {
        "projects": ["read", "update"],
        "tasks": ["create", "read", "update"],
        "users": ["read"]
      }
    }
    ```
