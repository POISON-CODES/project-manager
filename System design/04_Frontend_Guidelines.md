# 04. Frontend Architecture & Guidelines

**Role:** Frontend Lead
**Stack:** Next.js (App Router) + Tailwind + React Query

This document defines the "Rich Aesthetic" and "Premium Feel" requirements, ensuring the app looks and feels like a top-tier SaaS (e.g., Linear, Notion).

---

## 1. Design System (The "Developer/Night Owl" Theme)
**Goal:** A high-contrast, eye-friendly "IDE-like" aesthetic. Dark mode first.
**Tools:** `shadcn/ui` (Radix Primitives + Tailwind).

### 1.1 Typography
*   **Font Family:** **`Roboto Mono`** (Google Fonts).
*   **Usage:** Used for EVERYTHING (Headers, Body, Code). This reinforces the "Developer Tool" feel.
*   **Weights:** 400 (Regular) for body, 500 (Medium) for interactive elements, 700 (Bold) for headers.

### 1.2 Color Palette (Night Owl Inspired)
We use a curated palette of deep blues and soft grays to reduce eye strain.

| Variable | Hex Code | Description | Usage |
| :--- | :--- | :--- | :--- |
| **Background** | `#011627` | Deep Night Blue | Main app background. |
| **Surface** | `#0b2942` | Lighter Blue-Grey | Cards, Sidebars, Modals. |
| **Text Primary** | `#d6deeb` | Soft White | Main content text. |
| **Text Muted** | `#637777` | Desaturated Teal | Secondary metadata/labels. |
| **Accent** | `#82aaff` | Soft Cornflower Blue | Primary Buttons, Active States (Not "Powder Blue"). |
| **Border** | `#1d3b53` | Subtle Blue-Grey | Dividers and Card borders. |
| **Success** | `#addb67` | Vibrant Lime | "Done" status. |
| **Destructive/Halted** | `#ef5350` | Soft Red | "Halted" banners. |

### 1.3 UI Characteristics
*   **No Shadows:** Flat, border-based design (1px borders).
*   **Compact Density:** High information density (like VS Code file explorer).
*   **Code-like Syntactic Sugar:** Status badges look like code tags (e.g., `<TODO />`).

---

## 2. Component Architecture

### 2.1 Directory Structure (Feature-Based)

```
src/
├── app/                    # Next.js App Router (Pages)
│   ├── (dashboard)/        # Logic-heavy views
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── layout.tsx      # Sidebar + Header
│   └── (auth)/             # Login/Signup
├── components/
│   ├── ui/                 # Dumb Primitives (Button, Input) - derived from shadcn
│   ├── domain/             # Feature Components (TaskCard, ProjectRow)
│   └── shared/             # Layouts, Loaders
├── lib/
│   ├── api.ts              # Typed Axios/Fetch client
│   └── store.ts            # Zustand Stores
└── hooks/                  # React Query Hooks
```

### 2.2 Smart vs. Dumb Components
*   **Smart (Containers):** Located in `app/.../page.tsx` or specialized wrappers. They fetch data via `useQuery` and pass props down.
*   **Dumb (UI):** Receive data via props. NO side effects or API calls. This ensures the "Task Card" can be reused in the Kanban Board *and* the List View without duplicating logic.

---

## 3. Complex UI Implementation Specs

### 3.1 The Kanban Board (Tasks)
*   **Library:** `@dnd-kit/core`.
*   **Performance:** Virtualized lists if > 100 tasks.
*   **"Halted" State:**
    *   If `task.isHalted === true`:
        *   Apply `border-red-500` and diagonal striped background.
        *   **Disable Dragging:** The `useDraggable` hook must be conditionally disabled.
        *   Tooltip: "Blocked by [Dependency Name]".

### 3.2 The Global Gantt (Projects)
*   **Library:** `frappe-gantt` (Lightweight) or `vis-timeline` (Robust).
*   **Visualization:**
    *   **Unassigned Projects:** Rendered in a separate "Pool" at the top.
    *   **Claiming:** Dragging from "Pool" to a User's distinct timeline row triggers the `claimProject` API.

### 3.3 The Input Forms (Intake)
*   **Library:** `react-hook-form` + `zod`.
*   **Dynamic Rendering:**
    *   The `FormTemplate.schema` (JSONB) is parsed to generate inputs at runtime.
    *   *Example:* `{ "field": "budget", "type": "number" }` renders `<Input type="number" />`.

---

## 4. State Management Strategy

### 4.1 Server State (React Query)
*   **Stale Time:** 30 seconds (Data stays fresh).
*   **Invalidation:**
    *   Mutation: `createTask` -> `onSuccess` -> `queryClient.invalidateQueries(['tasks'])`.

### 4.2 Client State (Zustand)
Used for ephemeral UI state that doesn't need persistence.
*   **Workflow Builder:** keeping track of the "Drag Source" and "Drop Target" connections before saving.
*   **Sidebar State:** Collapsed/Expanded preference.

---

## Action Item
Please review the Frontend Guidelines.
**Check:** Does this match your expectation for "Rich Aesthetics"? (e.g., using `shadcn/ui` + `framer-motion` concepts).
