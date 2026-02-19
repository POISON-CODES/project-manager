# Tech Stack & Conventions

## Core Stack
- **Runtime:** Node.js (Latest LTS)
- **Framework:** NestJS (Standard Mode, not Monorepo mode for simplicity unless needed)
- **Language:** TypeScript 5.x (Strict Mode)
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma
- **Queue:** BullMQ (Redis)
- **Auth:** Supabase Auth (JWT)

## Libraries
- **Validation:** `zod` + `nestjs-zod`
- **Config:** `@nestjs/config`
- **Logging:** `nestjs-pino`
- **Docs:** `@nestjs/swagger`
- **Http:** `axios` (for external calls)

## Coding Conventions
- **Controllers:** Thin. Delegate to Services.
- **Services:** Contain Business Logic.
- **Repositories:** No custom repos; use Prisma Service directly for simplicity, or generic repository pattern if logic gets complex.
- **Error Handling:** Custom `AppError` class + Global Filter.
- **Env Vars:** Validated on startup. Validations fail fast.
