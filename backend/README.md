# DevCollab — Backend

The backend service for **DevCollab**, a collaborative workspace platform designed around organizations, memberships, roles, permissions, and workspace-level access control.

The backend follows a modular architecture with clear separation between routes, controllers, services, repositories, validation, configuration, and database access.

---

## Tech Stack

- **Node.js**
- **Express.js**
- **PostgreSQL**
- **pg** — PostgreSQL client
- **JWT** — Access & Refresh Token authentication
- **bcrypt** — Password hashing
- **Zod** — Request validation
- **dotenv** — Environment configuration
- **EJS** — Authentication views
- **Nodemon** — Development server

---

## Architecture

The backend follows a layered module-based architecture:

```text
Request
   ↓
Route
   ↓
Authentication / Validation Middleware
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
PostgreSQL