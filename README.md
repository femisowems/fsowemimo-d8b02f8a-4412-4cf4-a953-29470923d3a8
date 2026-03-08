# Secure Task Management 🛡️

<a alt="Secure Task Management Logo" href="#" target="_blank" rel="noreferrer"><img src="apps/dashboard/public/logo.png" width="45"></a>

A modern, enterprise-ready task management platform built with high performance, security, and visual excellence in mind. This Nx monorepo features a cutting-edge Angular frontend styled with Tailwind CSS v4 and a resilient NestJS backend.

## 🎥 Watch the Walkthrough/Demo Video

> [!NOTE]
> Covers: RBAC flow, JWT auth lifecycle, Org scoping, Guard + decorator architecture, Trade-offs and future roadmap.

[![Secure Task Management App – Walkthrough Video](https://cdn.loom.com/sessions/thumbnails/a38330e102fc45ac91246d0631e3a378-c60bd0668798397d-full-play.gif)](https://www.loom.com/share/a38330e102fc45ac91246d0631e3a378)

[Watch the Walkthrough/Demo Video](https://www.loom.com/share/a38330e102fc45ac91246d0631e3a378)

## 📜 Assessment Alignment

This implementation satisfies all core requirements:

- **JWT Authentication:** Real implementation with Supabase/Passport (no mocks).
- **Hierarchical RBAC:** Role-based access control with guards and decorators.
- **Org-scoped Access Control:** Data isolation at the query level.
- **Modular Architecture:** Structured as an Nx monorepo.
- **Audit Logging:** Tracks critical user actions.
- **Responsive UI:** Built with Angular 19 and Tailwind CSS v4.
- **Testing Strategy:** Unit and E2E testing ready.
- **Documentation:** Comprehensive trade-offs and future work analysis.

## 🚀 Key Features

### Core Functionality

- **Authenticated Dashboard:** Secure user access via Supabase Auth.
- **Task Management:** Create, read, update, and delete tasks with ease.
- **Organization Support:** Manage tasks within different organization contexts.
- **Role-Based Access Control (RBAC):** Granular permission management.

### 📈 Bonus Features & UX Refinements

- **The Secure Lifecycle Branding**: Vibrant Magenta-Violet-Orange palette with glassmorphic UI elements.
- **Productive Management**: Replaced slow dropdowns with direct inline icons for user actions (Edit, Verify, Delete).
- **Dark Mode Toggle**: Native support for sleek dark-themed workspaces.
- **Keyboard Shortcuts**: Power-user shortcuts for instant navigation (Press `?` to view).
- **Global Accessibility**: Added Escape key support to instantly dismiss modals and guides.
- **Task Analytics**: Real-time visual progress tracking and audit logging.

![Secure Task Management Dashboard](docs/images/dashboard-preview.png)

## 📊 Trade-offs & Design Decisions

### Chosen

- **Decorator-based RBAC:** Prioritized clarity and developer experience for defining permissions.
- **Shared DTOs:** Ensures type safety across Frontend and Backend.
- **Org Scoping at Query Layer:** Implemented for performance and data isolation.
- **Supabase for Auth:** leveraged for secure JWT issuance and user management without reinventing the wheel.

### Not Implemented (Time-boxed)

- **Refresh Tokens:** Standard short-lived access tokens used.
- **RBAC Caching Layer:** Permissions are checked on every request for simplicity.
- **Field-level Permissions:** Focus remained on resource-level access.

## 🔮 Future Improvements & Recent Enhancements

### 🧪 Quality Assurance: Comprehensive Unit Testing (New)

To align with the "champion of best practices for well-tested code" standard, backend tests have been fully implemented.

- **Critical Logic Covered:** Wrote and integrated full `Jest` unit tests for the NestJS API Guards, `TasksService`, `TasksController`, `UsersService`, and `UsersController` ensuring maximum coverage.
- **Dependency Isolation:** Adopted advanced DI mocking techniques to properly isolate business logic from structural elements (`RbacService`, `Reflector`, Repositories).

### ⚙️ CI/CD: Enterprise Pipeline (New)

The project's GitHub actions CI/CD pipeline was entirely redesigned.

- **Nx Affected Tooling:** The CI pipeline now intelligently isolates builds, tests, and linting based purely on the `git` dependency graph calculation by leveraging `nrwl/nx-set-shas@v4` and `npx nx affected`.
- **Performance:** This ensures that checks run extremely quickly, executing in parallel (`--parallel=3`), modeling an enterprise-ready `Agile/Scrum` delivery environment capable of handling high developer throughput.

### 🎨 Branding: High-End Visual Identity (New)

The platform has been completely rebranded with **"The Secure Lifecycle"** concept.

- **Dynamic Gradients**: Leverages Tailwind 4's powerful configuration for custom `brand-gradient` utilities.
- **Cohesive UI**: Unified color system across Audit Logs, Auth flows, and Task Management.

### 🛡️ Resilience: Fault-Tolerant Architecture (New)

The User Management system has been hardened to survive configuration gaps.

- **Graceful Degradation**: The API now detects missing Supabase admin keys and automatically falls back to local data synchronization, ensuring the dashboard stays operational in any environment.

### Scalability: Event-Driven Architecture (New)

To support massive scale (a critical requirement for Jobber's ecosystem), the Audit Logging system has been refactored to an **Event-Driven Architecture** using `EventEmitter2`.

- **Decoupled Logic:** The `TasksService` now emits events (`audit.log`) instead of injecting the `AuditService` directly.
- **Performance:** Asynchronous event listeners (`@OnEvent('audit.log', { async: true })`) ensure that audit logs do not block the main request execution thread, drastically improving API response times when creating or modifying tasks at scale.

### Security

- **Refresh Token Rotation:** Enhance session security.
- **CSRF Protection:** Additional layer for web security.
- **RBAC Caching (Redis):** Improve performance for complex permission checks.
- **Rate Limiting:** Protect API endpoints.

### Scalability

- **Postgres Row-Level Security:** Move authorization closer to the data.
- **Event-based Audit Logging:** Decouple logging from business logic.
- **Microservice Extraction:** Isolate the Auth module if scaling horizontally.

### Product

- **Advanced Role Delegation:**Allow users to assign roles.
- **Task Comments & Attachments:** Collaboration features.
- **Real-time Updates (WebSockets):** Live task board updates.

## 🧑💻 Developer Experience

- **ESLint + Prettier:** Consistent code style.
- **Nx Affected Builds:** Efficient CI/CD pipeline.
- **Shared Types:** Type safety across the stack.
- **Environment-based Config:** Seamless switching between Dev and Prod.

## 🛠️ Technology Stack

**❤️ Built With:** Angular 19 • NestJS • Nx • Tailwind v4 • TypeORM • Supabase

### Frontend (Dashboard)

- **Framework:** Angular 19+
- **Styling:** Tailwind CSS v4 (PostCSS)
- **State Management:** Angular Signals / Services
- **Icons:** Lucide Angular

### Backend (API)

- **Framework:** NestJS
- **Database:** SQLite (Dev) / PostgreSQL (Prod)
- **ORM:** TypeORM
- **Authentication:** Passport-JWT & Supabase

## 📦 Project Structure

```
├── apps/
│   ├── dashboard/          # Angular Frontend Application
│   │   ├── src/app/        # App source (Pages, Components, Services)
│   │   ├── project.json    # Build configuration
│   │   └── vercel.json     # Vercel deployment config (SPA rewrites)
│   └── api/                # NestJS Backend Application
│       ├── src/app/        # API Modules (Auth, Tasks, Users)
│       └── assets/         # Static assets
├── libs/                   # Shared Libraries
│   ├── api/                # Shared backend logic
│   ├── dashboard/          # Shared frontend UI/logic
│   └── data/               # Shared entities and interfaces
└── tools/                  # Nx workspace tools
```

## 🗄️ Data Model

The application uses a relational database model with TypeORM entities.

### Schema Description

- **Organization:** The root entity for multi-tenancy. Supports a hierarchical structure via self-referencing `parentOrganizationId`.
- **User:** Belongs to a single Organization. Linked to Supabase Auth via `supabaseUserId`.
- **Task:** Creating by a User within an Organization. Access is scoped to the Organization.
- **AuditLog:** Records critical actions (create, update, delete) performed by users.

### ER Diagram

```mermaid
erDiagram
    Organization ||--o{ User : "has members"
    Organization ||--o{ Task : "has tasks"
    Organization ||--o{ Organization : "parent of"

    User ||--o{ Task : "creates"
    User {
        uuid id
        string email
        enum role
        string supabaseUserId
    }

    Organization {
        uuid id
        string name
        uuid parentOrganizationId
    }

    Task {
        uuid id
        string title
        string status
        string category
    }

    AuditLog {
        uuid id
        string action
        string resourceType
        timestamp timestamp
    }
```

## 🔐 Access Control Implementation

### Hierarchy & Permissions

The system implements a hierarchical Role-Based Access Control (RBAC) model:

1.  **Organization Level:** Users are scoped to a specific Organization.
    - **Parent Orgs:** Admins in parent organizations can view data in child organizations.
    - **Child Orgs:** Data is strictly isolated from other organizations.
2.  **User Roles:**
    - **Owner:** Full access to Organization settings and all data.
    - **Admin:** Can manage tasks and users but cannot delete the Organization.
    - **Viewer:** Read-only access to tasks.

### JWT Integration

1.  **Authentication:** The frontend authenticates with Supabase and receives a JWT.
2.  **Transmission:** The JWT is sent in the `Authorization: Bearer <token>` header.
3.  **Validation:** `Apps/api` validates the token using `Passport-JWT` strategy against the Supabase secret.
4.  **Context:** The API extracts the `sub` (Supabase User ID) to look up the internal User entity and attach it to the Request object.
5.  **Authorization:** `RolesGuard` checks the User's role against the route's `@Roles()` decorator.

## 📡 API Documentation

### Endpoints

| Method    | Endpoint             | Description                   | Access        |
| :-------- | :------------------- | :---------------------------- | :------------ |
| **Auth**  |                      |                               |               |
| `GET`     | `/auth/me`           | Get current user profile      | Authenticated |
| **Tasks** |                      |                               |               |
| `GET`     | `/tasks`             | List all tasks for user's org | Read+         |
| `POST`    | `/tasks`             | Create a new task             | Admin/Owner   |
| `PUT`     | `/tasks/:id`         | Update a task                 | Admin/Owner   |
| `DELETE`  | `/tasks/:id`         | Delete a task                 | Admin/Owner   |
| **Users** |                      |                               |               |
| `PUT`     | `/users/:id`         | Update user profile           | Self/Admin    |
| `PATCH`   | `/users/preferences` | Update UI preferences (theme) | Self          |

### Sample Request/Response

**GET /tasks**

_Request Header:_
`Authorization: Bearer eyJhbGciOiJIUzI1Ni...`

_Response (200 OK):_

```json
[
  {
    "id": "a1b2c3d4-...",
    "title": "Update Security Protocols",
    "status": "IN_PROGRESS",
    "category": "WORK",
    "organizationId": "org-123",
    "createdAt": "2023-10-27T10:00:00Z"
  }
]
```

## 🏁 Getting Started

### Prerequisites

- Node.js (v20+)
- npm (v10+)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory:

    ```env
    # Supabase Configuration (Required)
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_URL=your_supabase_url
    SUPABASE_ANON_KEY=your_supabase_anon_key

    # API Configuration
    VITE_API_URL=http://localhost:3001/api  # For local development
    # VITE_API_URL=https://your-production-api.com/api # For production
    ```

### Running Locally

You can run both the dashboard and API in parallel.

**Start both (recommended):**
Open two terminal tabs.

Tab 1 - API:

```bash
npm run start:api
# Runs on http://localhost:3001
```

Tab 2 - Dashboard:

```bash
npm run start:dashboard
# Runs on http://localhost:4200
```

_Note: For styles debugging or development, run the Tailwind watcher in a separate terminal:_

```bash
npm run build:tailwind -- --watch
```

## 🐛 Troubleshooting

### Styles Missing?

- Run the Tailwind watcher: `npm run build:tailwind -- --watch`
- Restart the dashboard server.

### SQLite "Foreign Key Constraint" Error?

- Delete `database.sqlite` in the root and restart the API (`npm run start:api`).

### CORS Error on Vercel?

- Ensure `environment.prod.ts` uses the production API URL (not localhost).
- This is handled by `fileReplacements` in `project.json`.

---

Built with ❤️ using Nx.
