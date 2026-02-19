# Backend Folder Structure (NestJS Modular Monolith)

## Root Directory
```
/backend
  ├── /src
  │   ├── /common                  # Shared across all modules
  │   │   ├── /decorators          # @GetUser(), @Roles()
  │   │   ├── /filters             # Global Exception Filters
  │   │   ├── /guards              # AuthGuard, RolesGuard
  │   │   ├── /interceptors        # Logging, Response Transformation
  │   │   ├── /pipes               # Validation Pipes
  │   │   └── /utils               # Helper functions
  │   ├── /config                  # Environment Config (Zod validated)
  │   ├── /database                # Prisma Service & Seeds
  │   ├── /modules                 # Domain Modules
  │   │   ├── /iam                 # Identity & Access Management
  │   │   ├── /project             # Core Project/Task Logic
  │   │   ├── /workflow            # Automation Engine
  │   │   └── /notification        # Email/Slack Adapters
  │   ├── app.module.ts            # Root Module
  │   └── main.ts                  # Entry Point
  ├── /prisma                      # Database Schema & Migrations
  │   └── schema.prisma
  ├── /test                        # E2E Tests
  ├── .env.example
  ├── .eslintrc.js
  ├── .prettierrc
  ├── docker-compose.yml
  ├── nest-cli.json
  ├── package.json
  └── tsconfig.json
```

## Module Internal Structure
Each module (e.g., `src/modules/project`) follows this pattern:
```
/project
  ├── /controllers        # Route Handlers
  │   ├── project.controller.ts
  │   └── task.controller.ts
  ├── /services           # Business Logic
  │   ├── project.service.ts
  │   └── task.service.ts
  ├── /dto                # Data Transfer Objects (Zod/ClassValidator)
  │   ├── create-project.dto.ts
  │   └── update-task.dto.ts
  ├── /entities           # Domain Entities (optional if using Prisma types directly)
  └── project.module.ts   # Module Definition
```
