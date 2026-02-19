# 06. DevOps & Security Strategy

**Role:** DevOps Engineer
**Infrastructure:** Docker (Backend) + Netlify (Frontend)
**CI/CD:** GitHub Actions

This document defines how we deploy, secure, and monitor the NexusFlow application.

---

## 1. Deployment Architecture (The "Split" Strategy)

### 1.1 Frontend (Next.js) -> Netlify/Vercel
*   **Method:** Git Integation.
*   **Trigger:** Push to `main` branch.
*   **Build Command:** `npm run build`.
*   **Environment Variables:** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### 1.2 Backend (NestJS + Worker) -> Docker (Hostinger VPS)
*   **Containerization:** Multi-stage Dockerfile to keep image size small (<100MB).
*   **Orchestration:** `docker-compose.yml` manages:
    1.  `api-service` (NestJS REST API).
    2.  `worker-service` (NestJS BullMQ Processor).
    3.  `redis` (Queue persistence).

**Deployment Workflow:**
1.  **CI:** GitHub Action builds Docker Image -> Push to GHCR (GitHub Container Registry).
2.  **CD:** GitHub Action SSHs into VPS -> `docker pull` -> `docker compose up -d`.

---

## 2. CI/CD Pipelines (GitHub Actions)
**(Note: For MVP, we will run these manually. Automated pipelines are Future Scope.)**

### 2.1 `pr-check.yml` (On Pull Request)
<!-- 
1.  **Lint:** `npm run lint` (Must pass with 0 warnings).
2.  **Test:** `npm run test` (Unit/Integration).
3.  **Build:** `npm run build` (Ensures no compilation errors).
-->

### 2.2 `deploy-backend.yml` (On Push to Main)
<!--
1.  **Build Docker:** `docker build -t ghat/nexusflow-backend:latest .`
2.  **Push:** Push to GitHub Container Registry.
3.  **Deploy:** SSH to VPS and restart containers.
-->

---

## 3. Security Hardening

### 3.1 Rate Limiting (DDoS Protection)
*   **Implementation:** `@nestjs/throttler` (Token Bucket Algorithm).
*   **Public Endpoints:** Limit to 10 requests / minute (e.g., Login).
*   **Authenticated Endpoints:** Limit to 100 requests / minute.

### 3.2 Secrets Management
*   **Rule:** NO `.env` files in Git.
*   **Production:** Secrets injected via Docker Env Vars / Netlify UI.
*   **Development:** Local `.env` file (gitignored).

### 3.3 Data Protection
*   **JWT:** Short-lived Access Tokens (15 min) + HttpOnly Refresh Cookies.
*   **CORS:** Strict allows only the URL defined in `.env` (e.g., `FRONTEND_URL`).

---

## 4. Monitoring & Logs
*   **Logs:** All logs structured as JSON.
    *   *Tools:* Docker logs (MVP) -> Promtail/Loki (Future).
*   **Health Checks:** `/health` endpoint for Uptime Robot monitoring.

---

## Action Item
Please review the DevOps Strategy.
**Confirmation:** This concludes the Architecture Phase. Once approved, we are ready to start coding.
