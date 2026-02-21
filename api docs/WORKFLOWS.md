# Workflows API Documentation

## Base URL
`/workflows`

## Endpoints

### 1. Create Workflow Automation
Defines a new automation rule (e.g., "When task moves to Review, notify Admin").

- **URL:** `/`
- **Method:** `POST`
- **Auth Required:** Yes (JWT + Role: ADMIN/PROJECT_LEAD)
- **Request Body:**
  ```json
  {
    "name": "Review Notification",
    "triggerConfig": { "event": "status_change", "value": "REVIEW" },
    "actionConfig": { "type": "webhook", "url": "https://..." }
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** `{ "success": true, "data": { ...createdWorkflow } }`

---

### 2. List Active Workflows
Lists all configured automations.

- **URL:** `/`
- **Method:** `GET`
- **Auth Required:** Yes (JWT + Role: ADMIN/PROJECT_LEAD)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": [...] }`
