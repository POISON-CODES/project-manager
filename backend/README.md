
# NexusFlow Project Manager Backend

Enterprise-grade project management backend with automated workflow engine.

## Features
- **Project Lifecycle**: Intake forms with JSON Schema validation, Story/Task hierarchy.
- **Automation Engine**: BullMQ-backed workflow rules (If X -> Do Y) with HTTP Webhook actions.
- **RBAC**: Role-based access control (ADMIN, PROJECT_LEAD, MEMBER, STAKEHOLDER).
- **Audit Logs**: Comprehensive tracking of automation actions and task status changes.
- **Auth**: Supabase JWT integration with JWKS validation.

## Tech Stack
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: BullMQ (Redis)
- **Validator**: Zod
- **Documentation**: Swagger/OpenAPI

## Prerequisites
- Node.js v18+
- Docker & Docker Compose
- Supabase Project (for Auth)

## Setup

### 1. Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/project_manager?schema=public"
REDIS_HOST="localhost"
REDIS_PORT=6379
SUPABASE_URL="yoursupabaseurl"
SUPABASE_KEY="yoursupabasekey"
SUPABASE_JWT_SECRET="yoursupabasejwtsecret"
```

### 2. Infrastructure
Start Postgres and Redis:
```bash
docker-compose up -d
```

### 3. Database
Run migrations:
```bash
npx prisma migrate dev
```

### 4. Run Application
```bash
npm install
npm run start:dev
```

## API Documentation
Once the server is running, visit:
[http://localhost:3000/api](http://localhost:3000/api)

## Testing
Run E2E tests:
```bash
npm run test:e2e
```
