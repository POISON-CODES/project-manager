# NexusFlow Project Manager

A comprehensive project management and automation engine built with NestJS, Next.js, and Supabase.

## 🚀 Overview
NexusFlow is designed to help teams manage projects, user stories, and tasks while providing powerful automation workflows via BullMQ and Redis.

## 🏗️ Technology Stack
- **Backend**: NestJS, Prisma ORM, BullMQ, Redis, Passport (Supabase JWT)
- **Frontend**: Next.js, TailwindCSS
- **Database**: PostgreSQL (Supabase)
- **Monitoring**: Redis Insight, BullBoard

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Docker (for Redis and Redis Insight)
- Supabase account and project

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file (see `.env.example` or provided configuration).
4. Start Redis and Redis Insight:
   ```bash
   docker-compose up -d
   ```
5. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
6. Start the development server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📈 Monitoring & Maintenance

### BullBoard (Queue Monitoring)
Access the BullMQ dashboard to monitor automation tasks:
- **URL**: `http://localhost:3001/admin/queues`

### Redis Insight
Monitor your local Redis instance:
- **URL**: `http://localhost:8001`

### Testing
NexusFlow has a comprehensive test suite (Unit, Integration, E2E).
- **Run all tests**: `npm run test:all` (inside `backend` directory)
- See [TESTING.md](backend/TESTING.md) for more details.

## 📡 API Documentation

All routes require a valid Supabase JWT Bearer token unless otherwise specified.

### Auth
- `POST /auth/sync`: Syncs Supabase users with the local database.

### Users
- `GET /users/me`: Returns the currently authenticated user's profile.
- `GET /users`: List all workspace users.
- `PATCH /users/:id/status` (Admin): Update user status.
- `PATCH /users/:id/role` (Admin): Update user role.

### Projects
- `POST /projects`: Create a new project.
- `GET /projects`: List projects with filters.
- `GET /projects/:id`: Get project details.
- `GET /projects/timeline`: Get project/story/task hierarchy for Gantt views.
- `PATCH /projects/:id/claim`: Assign a project lead.
- `PATCH /projects/:id/stage`: Move a project to a new stage.

### User Stories
- `GET /stories/:id`: Get story details.
- `PATCH /stories/:id`: Update story.
- `POST /stories/:id/tasks`: Create a task within a story context.

### Tasks
- `GET /tasks`: List tasks with filters (status, user).
- `GET /tasks/:id`: Get task details.
- `PATCH /tasks/:id`: Update task.
- `POST /tasks/:id/comments`: Add a comment to a task.
- `POST /tasks/:id/dependencies`: Link tasks.

### Forms
- `POST /forms`: Create a project intake form template.
- `GET /forms`: List templates.
- `GET /forms/:id/public`: Publicly accessible form schema.

### Workflows
- `POST /workflows`: Create an automation rule.
- `GET /workflows`: List active workflows.

### Admin
- `GET /admin/stages`: Get Kanban stage metadata.

---
© 2024 NexusFlow Team.
