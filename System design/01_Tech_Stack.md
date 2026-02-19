# 01. Technology Stack Decisions

**Role:** Senior Systems Architect
**Status:** DRAFT (Pending Approval)

This document defines the authoritative technology stack for the NexusFlow Automation Engine. All choices are made to support the **"Microservice-Ready Modular Monolith"** architecture while delivering the required high-performance, rich-aesthetic user experience.

---

## 1. Core Principles
1.  **Strict Typing:** TypeScript is mandatory across the entire stack (Frontend, Backend, Infrastructure). `any` type is forbidden.
2.  **Contract-First:** API schemas (OpenAPI/Swagger) and Database Models are defined before business logic implementation.
3.  **Modular Monolith:** The backend is a single deployable unit but internally structured as isolated modules (Domains).

---

## 2. Frontend Architecture
**Objective:** Deliver a "Rich, Dynamic, Premium" user experience with complex interactive components (Kanban, Gantt, Workflow Builder).

### 2.1 CSS Framework Comparison & Selection
To achieve the "Rich Aesthetic" efficiently, we evaluated three top contenders:

| Option | Pros | Cons | Verdict |
| :--- | :--- | :--- | :--- |
| **Tailwind CSS** | **Speed**, utility-first consistency, zero-runtime overhead, massive ecosystem (shadcn/ui). | "Class soup" in HTML (mitigated by component extraction). | **SELECTED** |
| **Styled Components** | Scoped CSS, dynamic prop-based styling. | Runtime performance cost, larger bundle size, harder to standardize design tokens. | Rejected |
| **Mantine / Chakra** | Pre-built components, very fast MVP. | "Generic" look out-of-the-box, heavy overrides needed for custom premium design. | Rejected |

**Decision:** **Tailwind CSS**.
*   **Why:** It allows rapid development of a *custom* design system (unlike component libraries which look generic) without writing raw CSS. It integrates perfectly with **Radix UI** (via shadcn/ui) for accessible, unstyled primitives that we can style to be "Premium".

### 2.2 Core Frontend Stack
| Component | Choice | Justification |
| :--- | :--- | :--- |
| **Framework** | **Next.js (App Router)** | Industry standard. Deployable to Vercel/Netlify with zero config. SSR for SEO. |
| **Language** | **TypeScript** | Strict type safety. |
| **State** | **React Query + Zustand** | Best-in-class server/client state separation. |
| **Visuals** | **React Flow** (Workflow), **Framer Motion** (Animations) | **Framer Motion** is crucial for the "Dynamic/Premium" feel (micro-interactions). |

---

## 3. Backend Architecture
**Objective:** A robust, scalable foundation that is "Hostinger/Netlify Friendly" for MVP.

| Component | Choice | Justification |
| :--- | :--- | :--- |
| **Framework** | **NestJS** | Modular architecture. Can be deployed as a Docker container (VPS) or wrapped in a Serverless function (if needed later, though long-running is better for workers). |
| **Language** | **TypeScript** | Shared types with Frontend. |
| **API Docs** | **Swagger (OpenAPI)** | Contract-first generation. |

### 3.1 Queue System: Why BullMQ?
The PRD requires a **5-Day Exponential Backoff** for failed workflows.

| System | "Delayed" Job Support | Complexity | Ops Overhead | Verdict |
| :--- | :--- | :--- | :--- |
| **BullMQ (Redis)** | **Native & Simple.** Just `queue.add(data, { delay: 5000 })`. Retry strategies are built-in. | Low. Redis is simple key-value. | Minimal. (Managed Redis is cheap). | **SELECTED** |
| **Kafka** | **None.** Requires complex "Retries Topics" architecture (Topic A -> Topic A-Retry-1 -> ...). | Extreme. Requires Zookeeper/Kraft. | High. Overkill for MVP. | Rejected |
| **RabbitMQ** | Via Plugins (Delayed Message Exchange). | Medium. Dedicated broker. | Medium. Harder to host than Redis. | Rejected |

**Decision:** **BullMQ**. It is the *only* tool that handles "Delayed Retries" natively and simply, which is our #1 resilience requirement.

---

## 4. Data & Infrastructure
**Objective:** Reliability with minimal DevOps (PaaS/Managed Services).

| Component | Choice | Justification |
| :--- | :--- | :--- |
| **Primary Database** | **Supabase (PostgreSQL)** | Managed Postgres + Auth + Realtime. **Why:** It removes the need to manage a DB server. It provides a GUI for quick debugging. |
| **Auth** | **Supabase Auth** | Replaces custom JWT logic. Production-ready Auth (Email/Social) out of the box. |
| **Redis** | **Upstash** or **Railway Redis** | Serverless Redis for the BullMQ queue. (Supabase doesn't expose raw Redis for queues). |

---

## 5. Deployment Strategy (MVP Friendly)
**Constraint:** "Easy to host on Hostinger/Netlify."

### 5.1 The "Split" Interface
*   **Frontend (Next.js):** Deployed to **Netlify** or **Vercel**.
    *   *Why:* Zero-config, automatic CI/CD from Git. "git push" to deploy.
*   **Backend (NestJS + Worker):** Deployed to **Hostinger VPS (Docker)** or **Railway**.
    *   *Why:* The "Worker" (BullMQ) needs to be a **long-running process** to listen for jobs. It *cannot* be a Netlify Function (which times out after 10s).
    *   *Containerization:* We will provide a `docker-compose.yml` that spins up the Backend + Redis.
    *   **Hostinger Guide:** Buy VPS -> Install Docker -> `docker compose up`. Done.

---

## 6. Security Standards
*   **Validation:** **Zod** (integrated with NestJS Pipes).
*   **Secrets:** All handled via `.env` (Project URL, Redis URL, Supabase Keys).

---

## Action Item
Please review and **Approve** this stack. Once approved, I will proceed to **Task 2: Backend Architecture & Database Schema**.
