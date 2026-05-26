# Implementation Plan - Frontend Refactor and Architecture Modernization

This plan describes the strategy to refactor the Classcify student/teacher community college platform frontend from a monolithic react-router-dom and state structure into an enterprise-grade, clean, modular, and scalable architecture using React Router (v7), Redux Toolkit, TanStack Query, and a strict 4-layer feature-based layout.

## User Review Required

> [!IMPORTANT]
> - **Library Version Upgrades**: We will install and migrate to `react-router` (v7), `@reduxjs/toolkit`, and `react-redux`.
> - **Redux State Management**: Auth/user client state will be moved into Redux (`src/modules/auth/store/auth.slice.js`).
> - **Route and Component Fixes**: The existing `src/App.jsx` reference to `Events`, `TeacherCreate`, and `StudentCreate` without imports will be corrected by importing the respective modules.
> - **Layouts & Sidebar Active State**: Sidebars will be refactored to use standard React Router `NavLink` with classes driven by the `isActive` state parameter to automatically highlight the current path without manual path-matching state.

## Proposed Changes

We will restructure `/src` to segregate concerns into global wrappers/config (`/src/app`), feature modules (`/src/modules`), global reusable resources (`/src/components`, `/src/layouts`, `/src/hooks`, `/src/services`, `/src/utils`, `/src/constants`), global server-state stack (`/src/stack`), and centralized error structures (`/src/errors`).

---

### Phase 1: Dependency Setup and Project Configuration

We will install the required dependencies and configure path aliases for clean absolute imports.

#### [MODIFY] [package.json](file:///r:/ClasscifyPlatform/Frontend/package.json)
- Add dependencies:
  - `react-router` (v7)
  - `@reduxjs/toolkit`
  - `react-redux`
- Remove unused dependencies if any are dead (e.g. `@tanstack/react-router` which is not used since the app uses `react-router-dom`).

#### [MODIFY] [vite.config.js](file:///r:/ClasscifyPlatform/Frontend/vite.config.js)
- Add path aliases matching the required configuration:
  - `@/app` -> `/src/app`
  - `@/modules` -> `/src/modules`
  - `@/components` -> `/src/components`
  - `@/hooks` -> `/src/hooks`
  - `@/services` -> `/src/services`
  - `@/utils` -> `/src/utils`
  - `@/layouts` -> `/src/layouts`
  - `@/stack` -> `/src/stack`
  - `@/constants` -> `/src/constants`
  - `@/errors` -> `/src/errors`

#### [MODIFY] [jsconfig.json](file:///r:/ClasscifyPlatform/Frontend/jsconfig.json)
- Define standard compiler path mappings for absolute import auto-completion in IDEs.

---

### Phase 2: App Shell and Configuration Core (`/src/app`)

We will move styling, bootstrap configuration, routing tree, and Redux/TanStack setup into `/src/app`.

#### [NEW] [App.routes.jsx](file:///r:/ClasscifyPlatform/Frontend/src/app/App.routes.jsx)
- Define the entire React Router v7 routes tree using `createBrowserRouter`.
- Implement lazy loading for feature pages.
- Handle protected routes (using `ProtectedRoute` / `UnauthenticatedRoute`).
- Setup custom route-level error boundary layouts.

#### [NEW] [App.jsx](file:///r:/ClasscifyPlatform/Frontend/src/app/App.jsx)
- Act as the entry shell wrapper containing provider components:
  - `Provider` (Redux)
  - `QueryClientProvider` (TanStack Query)
  - `RouterProvider` (React Router)
  - `GlobalErrorBoundary` (Error handling boundary)
- Contains NO business logic.

#### [NEW] [App.store.js](file:///r:/ClasscifyPlatform/Frontend/src/app/App.store.js)
- Redux Toolkit store setup, combining slice reducers (e.g., auth, sidebar states).

#### [NEW] [App.stack.js](file:///r:/ClasscifyPlatform/Frontend/src/app/App.stack.js)
- Initialize the `QueryClient` for server state.

#### [NEW] [App.css](file:///r:/ClasscifyPlatform/Frontend/src/app/App.css)
- Rename `/src/index.css` to `/src/app/App.css` and clean up unused and duplicate styles while maintaining styling fidelity.

#### [MODIFY] [main.jsx](file:///r:/ClasscifyPlatform/Frontend/src/main.jsx)
- Clean up imports to load `/src/app/App` and mount it directly, matching the clean-code guidelines.

---

### Phase 3: Centralized Error and Logging Infrastructure (`/src/errors` & `/src/utils`)

We will implement the required advanced error-handling architectures.

#### [NEW] [AppError.js](file:///r:/ClasscifyPlatform/Frontend/src/errors/AppError.js)
- Base error structure storing standard name, message, module, source details.

#### [NEW] [ApiError.js](file:///r:/ClasscifyPlatform/Frontend/src/errors/ApiError.js)
- Subclass of AppError to handle HTTP-based server and network errors, extracting API response statuses.

#### [NEW] [ErrorCodes.js](file:///r:/ClasscifyPlatform/Frontend/src/errors/ErrorCodes.js) & [ErrorMessages.js](file:///r:/ClasscifyPlatform/Frontend/src/errors/ErrorMessages.js)
- Map error types to human-readable strings.

#### [NEW] [ErrorBoundary.jsx](file:///r:/ClasscifyPlatform/Frontend/src/errors/ErrorBoundary.jsx)
- React component fallback capturing runtime crashes and displaying fallback views.

#### [NEW] [logger.js](file:///r:/ClasscifyPlatform/Frontend/src/utils/logger.js)
- Lightweight logger outputting verbose stacks in development and keeping silent or logging safe details in production.

---

### Phase 4: Feature-Based Modular Architecture (`/src/modules`)

We will migrate pages and components from `src/pages` and local widgets into feature modules under `src/modules`.

- **`/src/modules/auth`**:
  - `/pages`: `AdminLogin.jsx`, `TeacherLogin.jsx`, `StudentLogin.jsx`, `RegistrationDashboard.jsx`
  - `/services`: `auth.service.js` (refactored signup, login, verify, logout api methods)
  - `/store`: `auth.slice.js` (manages auth state, tokens, user profile info)
- **`/src/modules/admin`**:
  - `/pages`: `AdminDashboard.jsx`, `AdminAnalytics.jsx`, `StaffManagement.jsx`, `AdminClassroom.jsx`
  - `/services`: `admin.service.js`
- **`/src/modules/teacher`**:
  - `/pages`: `TeacherDashboard.jsx`, `TeacherAttendance.jsx`, `TeacherClassroom.jsx`, `TeacherCreate.jsx`
  - `/services`: `teacher.service.js`
- **`/src/modules/student`**:
  - `/pages`: `StudentDashboard.jsx`, `StudentAttendance.jsx`, `StudentClassroom.jsx`, `StudentCreate.jsx`, `Community.jsx`, `AssetsPage.jsx`
  - `/services`: `student.service.js`

---

### Phase 5: Server State Architecture (`/src/stack`)

We will wrap TanStack Query fetches/mutations to decouple server synchronization logic from components.

- **`src/stack/auth.stack.js`**: Authentication queries/mutations.
- **`src/stack/student.stack.js`**: Student classroom, assignments, attendance queries.
- **`src/stack/teacher.stack.js`**: Attendance updates, classrooms, timetables.
- **`src/stack/admin.stack.js`**: Staff actions, analytics summaries.

---

### Phase 6: Global Shared Folder Cleanup

Refactor global items into dedicated directories:
- `/src/services/api.js`: Centered Axios instance with interceptors for headers, token renewals, and global errors.
- `/src/components/Common/`: Multi-sidebar components using React Router `NavLink`.
- `/src/layouts/`: Reusable outer dashboards layouts using `Outlet`.

---

## Verification Plan

### Automated Tests
- Run `npm run lint` to verify that there are no unreferenced parameters, unused imports, or bad types.
- Run `npm run build` to verify the build processes, chunk optimizations, and alias configurations.

### Manual Verification
- Launch the development server using `npm run dev`.
- Verify the main Landing/Registration dashboard.
- Verify Student, Teacher, and Admin login flows (and that localStorage tokens are correctly cached).
- Check that Sidebars correctly highlight links active status using router matching.
- Access dashboard subpages to verify nesting and outlet layouts.
- Simulate request timeouts/failures to check structured UI errors.
