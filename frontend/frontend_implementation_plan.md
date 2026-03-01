# Frontend Implementation Plan & Task List

## 1. Project Initialization & Configuration
- [x] **Clean Setup**: Remove Next.js default boilerplate styling.
- [x] **Fonts**: Configure `Roboto Mono` as the primary font via `next/font`.
- [x] **Tailwind Config**: Define the "Night Owl" color palette in `tailwind.config.ts`.
- [x] **Dependencies**: Install core libraries (`axios`, `@tanstack/react-query`, `zustand`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`).
- [x] **Shadcn UI Setup**: Initialize `shadcn-ui` and configure `components.json`.

## 2. Core Architecture & Standards
- [x] **API Layer**: Create `src/lib/api.ts` with Axios interceptors (handling auth tokens).
- [x] **State Management**:
    - [x] Setup `QueryClientProvider` in `layout.tsx`.
    - [x] Create `useUIStore` (Zustand) for sidebar/theme state.
- [x] **Types**: Define global interfaces in `src/types/` based on the PRD (Project, Task, UserStory).
- [x] **Utils**: Create `cn()` utility for class merging.

## 3. Design System (Atomic Components)
- [x] **Button**: Primary, Secondary, Ghost, Destructive variants. (Shadcn customized)
- [x] **Input/Form**: Text, Number, Select, Textarea (wrapped with `react-hook-form` support). (Shadcn customized)
- [x] **Card**: Base container for Kanban/Lists.
- [x] **Badge/Tag**: For Statuses (e.g., "Halted", "In Progress").
- [x] **Modal/Dialog**: For creating tasks/projects.
- [ ] **Toast**: For notifications (Using Sonner/Deprecated Toast handled).

## 4. Feature Implementation (Iterative)

### Phase A: Layouts & Navigation
- [x] **App Shell**: Sidebar (Collapsible), Top Header (User profile).
- [ ] **Auth Layout**: Simple centered layout for Login/Signup.

### Phase B: Dashboard & Projects
- [x] **Dashboard Home**: Summary stats (Active Projects, My Tasks).
- [x] **Project List**: Data table with sorting/filtering and "Halted" indicators.
- [ ] **Project Details**: Tabbed view (Kanban | Gantt | Settings).

### Phase C: Task Management (Kanban)
- [x] **Kanban Board**: Drag-and-drop columns using `@dnd-kit`.
- [x] **Task Card**: Rich card with tags, assignees, and "blocked" visual indicators.

### Phase D: Intake Forms
- [x] **Dynamic Form Renderer**: Component that takes valid JSON schema and renders inputs.

## 5. API Integration
- [ ] `auth.service.ts`: Login, Logout, Profile.
- [x] `projects.hook.ts`: Query hooks for Projects.
- [x] `tasks.hook.ts`: Query hooks for Tasks/Stories.

## 6. Optimization & Final Polish
- [ ] **Accessibility Check**: Ensure ARIA labels on interactive elements.
- [ ] **Performance**: implementation of lazy loading for heavy routes.
