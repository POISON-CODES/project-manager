# Users API Documentation

## Base URL
`/users`

## Endpoints

### 1. Get My Profile
Retrieves the profile of the currently authenticated user.

- **URL:** `/me`
- **Method:** `GET`
- **Auth Required:** Yes (JWT)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ ...userObject }`

---

### 2. Update My Profile
Updates the authenticated user's profile details.

- **URL:** `/me/profile`
- **Method:** `PATCH`
- **Request Body:**
  ```json
  {
    "name": "New Name",
    "avatarUrl": "https://..."
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": { ...updatedUser } }`

---

### 3. List All Users
Retrieves a directory of all users in the system (useful for assignees/filters).

- **URL:** `/`
- **Method:** `GET`
- **Auth Required:** Yes (JWT)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": [...] }`

---

### 4. Global Activity Feed
Fetches a list of recent activities across the system. Can be filtered by user.

- **URL:** `/activity`
- **Method:** `GET`
- **Query Params:** `userId=uuid` (Optional)
- **Auth Required:** Yes (JWT)
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": [...] }`

---

### 5. Update User Status (Admin Only)
Changes the status of a user (e.g., ACTIVE, INACTIVE, PENDING).

- **URL:** `/:id/status`
- **Method:** `PATCH`
- **Auth Required:** Yes (JWT + Role: ADMIN)
- **Request Body:**
  ```json
  {
    "status": "ACTIVE"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": { ...updatedUser } }`

---

### 6. Update User Role (Admin Only)
Promotes or demotes a user's role.

- **URL:** `/:id/role`
- **Method:** `PATCH`
- **Auth Required:** Yes (JWT + Role: ADMIN)
- **Request Body:**
  ```json
  {
    "role": "MEMBER" // ADMIN, PROJECT_LEAD, MEMBER, STAKEHOLDER
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "success": true, "data": { ...updatedUser } }`
