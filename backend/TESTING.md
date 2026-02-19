# NexusFlow Testing Guide

This document outlines the testing strategy and execution commands for the NexusFlow backend.

## Testing Strategy

The system utilizes a three-tier testing approach to ensure reliability and performance:

1.  **Unit Tests**: Focused on individual services, controllers, and logic in isolation. Dependencies are mocked.
2.  **Integration Tests**: Verified interactions between modules (e.g., Services and Database) using real or semi-mocked environments.
3.  **End-to-End (E2E) Tests**: Full system tests that perform actual HTTP requests against a running or temporary server instance to verify user flows.

---

## Running Tests

Navigate to the `backend` directory first:
```bash
cd backend
```

### 1. Run All Tests
To run the entire suite sequentially (Unit -> Integration -> E2E):
```bash
npm run test:all
```

### 2. Run Specific Suites
- **Unit Tests Only**: `npm run test:unit`
- **Integration Tests Only**: `npm run test:integration`
- **E2E Tests Only**: `npm run test:e2e`

### 3. Individual E2E Scenarios
You can run specific E2E files to speed up development:
```bash
# Example: Run only Task Management tests
npx jest --config ./test/jest-e2e.json test/task-management.e2e-spec.ts
```

### 4. Code Coverage
To generate a coverage report for the core logic:
```bash
npm run test:cov
```

---

## Test File Locations
- **Unit/Integration**: Located alongside source files in `src/` (e.g., `user.service.spec.ts`, `projects.integration.spec.ts`).
- **E2E**: Located in the root `test/` directory (`*.e2e-spec.ts`).

## Mocking & Security
Tests use `Jest`'s `overrideGuard` feature to mock the `JwtAuthGuard`, allowing test scenarios to bypass Supabase authentication requirements while still testing the logic behind the protected routes.
