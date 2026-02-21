# Auth API Documentation

## Base URL
`/auth`

## Endpoints

### 1. User Login
Authenticates a user using email and password.

- **URL:** `/login`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** Supabase Session Object (includes standard JWT and user details).
- **Error Response:**
  - **Code:** 401 Unauthorized
  - **Description:** Invalid credentials.

---

### 2. User Signup
Registers a new user, synchronizes them with the local database, and performs an **Auto-Login**.

- **URL:** `/signup`
- **Method:** `POST`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "phoneNumber": "+1234567890"
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** Supabase Auth Response including `session` (for immediate redirection) and `user` details.
  ```json
  {
    "session": { "access_token": "...", "refresh_token": "...", "expires_in": 3600, ... },
    "user": { "id": "...", "email": "...", ... }
  }
  ```
- **Error Response:**
  - **Code:** 400 Bad Request
  - **Description:** Missing mandatory fields or invalid format.

---

### 3. Manual Sync
Triggers a manual synchronization of the currently authenticated user's profile from Supabase. Use this as a fallback if webhooks are delayed.

- **URL:** `/sync/manual`
- **Method:** `POST`
- **Auth Required:** Yes (JWT)
- **Success Response:**
  - **Code:** 201
  - **Content:**
    ```json
    {
      "success": true,
      "data": { ...userObject }
    }
    ```

---

