# Search API Documentation

## Base URL
`/search`

## Endpoints

### 1. Global Search
Performs a cross-resource search (Projects, Tasks, Users, Stories).

- **URL:** `/global`
- **Method:** `GET`
- **Query Params:** `q` (The search query string)
- **Auth Required:** Yes (JWT)
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "success": true,
      "data": {
        "projects": [...],
        "tasks": [...],
        "stories": [...],
        "users": [...]
      }
    }
    ```
