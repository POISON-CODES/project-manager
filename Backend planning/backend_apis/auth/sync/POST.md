# POST /auth/sync

Syncs user data from Supabase Auth webhook to the local PostgreSQL database.

## Details
- **Description**: Handles `INSERT` and `UPDATE` events from Supabase Auth to keep the local `User` table in sync.
- **Authentication**: Shared secret / Signature verification (Placeholder implemented).
- **Endpoint Type**: Internal / Webhook.

## Request
- **Headers**:
    - `x-supabase-signature`: Signature for verification.
- **Body**:
```json
{
  "type": "INSERT | UPDATE",
  "record": {
    "id": "uuid",
    "email": "string",
    "raw_user_meta_data": {
      "name": "string",
      "phone": "string",
      "avatar_url": "string"
    }
  }
}
```

## Response
- **Success (200 OK)**:
```json
{
  "success": true
}
```
