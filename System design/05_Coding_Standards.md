# 05. The Coding Bible: Standards & Workflows

**Role:** Lead Developer
**Scope:** Frontend & Backend

This document defines the **Non-Negotiable** rules for contributing to the NexusFlow codebase.

---

## 1. Code Quality & Linting
**Rule:** The CI pipeline will **FAIL** if any linter error or warning is present. No `console.log` in production.

### 1.1 Tools
*   **ESLint:** Extended with `airbnb-typescript`, `plugin:@nestjs/recommended`, `plugin:react-hooks/recommended`.
*   **Prettier:** Strict formatting. "Tabs vs Spaces" is decided by the `.prettierrc` (Spaces: 4).
*   **Husky:** Pre-commit hooks run `lint-staged`. You cannot commit bad code.

### 1.2 File Naming Conventions
*   **Files:** `kebab-case`. (e.g., `user-profile.component.tsx`, `auth.service.ts`).
*   **Classes:** `PascalCase`. (e.g., `UserProfileComponent`, `AuthService`).
*   **Variables/Functions:** `camelCase`. (e.g., `getUserProfile()`, `isHalted`).
*   **Constants:** `UPPER_SNAKE_CASE`. (e.g., `MAX_RETRY_COUNT = 5`).

---

## 2. Git Workflow & Version Control
**Branching Model:** Trunk-Based Development (Short-lived feature branches).

### 2.1 Conventional Commits
All commit messages must follow the [Angular Convention](https://www.conventionalcommits.org/en/v1.0.0/):
*   `feat: add user login endpoint` – new feature.
*   `fix: resolve halted state calculation` – bug fix.
*   `chore: update dependencies` – maintenance.
*   `docs: update API contract` – documentation.
*   `refactor: optimize workflow matching` – code change without external behavior change.

### 2.2 Pull Request (PR) Policy
*   **Size:** Max 400 lines (excluding lockfiles).
*   **Reviewers:** Minimum 1 approval required.
*   **Checks:** CI (Build + Test + Lint) must pass.

---

## 3. Testing Strategy
**Goal:** Confidence without implementation detail coupling.

| Type | Scope | Tool | Coverage Target |
| :--- | :--- | :--- | :--- |
| **Unit** | Core Logic Utils (e.g., "5-Day Backoff Calculator"). | **Jest** | 100% for Utils, 0% for Controllers. |
| **Integration** | API Endpoints + DB (using Test Containers). | **Supertest** | 80% (Happy Path + Error Cases). |
| **E2E** | Critical User Flows (Login -> Create Project). | **Playwright** | Critical Paths Only (Sanity Check). |

### 3.1 "The Golden Rule of Testing"
Do **NOT** test implementation details (e.g., "check if service function was called").
**DO** test behavior (e.g., "Given X input, API returns Y output").

---

## 4. Function Design & Documentation

### 4.1 Single Responsibility Principle (SRP)
**Golden Rule:** A function should do **one thing** and do it well.
*   **Refactor Signal:** If your function name has "And" in it (e.g., `validateAndSaveUser`), split it into two functions: `validateUser()` and `saveUser()`.
*   **Length:** If a function exceeds 20 lines, consider extracting sub-logic into private helper functions.

### 4.2 DRY (Don't Repeat Yourself)
*   **Duplication:** If you write the same logic twice, extract it into a utility function.
*   **Constants:** No magic numbers or strings. Extract them to a `constants.ts` file or use Enums.

### 4.3 Mandatory Documentation (TSDoc)
**Rule:** Every single function (exported or internal, middleware or util) **MUST** have a TSDoc comment block above it explaining **what** it does and **why**.

```typescript
/**
 * Calculates the exponential backoff delay based on the retry count.
 * @param retryCount - The number of times the job has failed.
 * @returns The delay in milliseconds.
 */
function calculateBackoff(retryCount: number): number { ... }
```

---

## 5. Documentation Requirements
*   **API:** All `@Controller` methods must have `@ApiOperation` and `@ApiResponse` decorators (Swagger).
*   **README:** Every module must have a standard `README.md` explaining its responsibility.

---

## Action Item
Please review the Coding Bible.
**Focus:** Are you comfortable with the strict "Zero Warning" policy and "Conventional Commits"?
