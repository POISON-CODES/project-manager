# API Contracts & Endpoints

## Global Standards
- **Prefix:** `/api/v1`
- **Auth:** `Authorization: Bearer <token>` (Supabase JWT)
- **Validation:** Zod Pipes
- **Response Format:**
  ```json
  {
    "success": true,
    "data": { ... },
    "meta": { ... } // Pagination etc.
  }
  ```

## 1. IAM Module (Identity)
| Method | Path | Description | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/sync` | Sync Supabase User to Local DB | Public (Auth Hook) |
| `GET` | `/users/me` | Get Current User Profile | User |

## 2. Project Module
### Projects
| Method | Path | Description | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/projects` | Create Project (via Intake Form) | Public/User |
| `GET` | `/projects` | List Projects (Filter: unassigned, my-projects) | User |
| `GET` | `/projects/:id` | Get Project Details | User |
| `PATCH` | `/projects/:id/claim` | Claim a Project | Lead |
| `PATCH` | `/projects/:id/stage` | Update Stage (Planning -> Active) | Lead/Admin |

### User Stories & Tasks
| Method | Path | Description | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/projects/:id/stories` | Create User Story | Lead |
| `POST` | `/stories/:id/tasks` | Create Task | Lead/Member |
| `GET` | `/tasks` | Get My Tasks (Kanban view) | Member |
| `PATCH` | `/tasks/:id/status` | Update Task Status (Triggers workflow) | Member |
| `PATCH` | `/tasks/:id/assign` | Assign User to Task | Lead |

### Dependencies
| Method | Path | Description | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/tasks/:id/dependencies` | Add Dependency (Internal/External) | Member |
| `DELETE` | `/tasks/:id/dependencies/:depId` | Remove Dependency | Member |
| `PATCH` | `/tasks/:id/dependencies/:depId/resolve` | Mark External Dep Resolved | Member |

## 3. Workflow Module (Automation)
| Method | Path | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/workflows` | List Workflows | Admin |
| `POST` | `/workflows` | Create Workflow | Admin |
| `POST` | `/webhooks/ingest/:source` | Ingest External Webhook | Public (HMAC) |

## 4. Intake Forms (Admin)
| Method | Path | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/forms` | List Form Templates | Admin |
| `POST` | `/forms` | Create Form Template | Admin |
| `GET` | `/forms/:id/public` | Get Public Form Schema | Public |
