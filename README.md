# Time Tracking Application

A full-stack time tracking web application for individuals (students, freelancers, researchers) to track time spent on lectures, seminars, projects, and other activities.

## Prerequisites

- **Docker & Docker Compose** (only requirement for the Docker path)

For local development without Docker you also need Java 21, Node.js 24+, Maven, and PostgreSQL 16.

## Quick Start (Docker Compose)

The easiest way to run everything - database, backend, frontend, and pgAdmin - with one command:

```bash
git clone <repo-url>
cd final-project-Hedi-Sayadi
docker compose up --build
```

Then open:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api
- **pgAdmin:** http://localhost:5050 (login: `admin@timetracking.local` / `admin`)

> No `.env` file is needed for Docker Compose. JWT secrets and database credentials are already configured inside `docker-compose.yml` with sensible defaults.

### Demo Login & Pre-loaded Data

After `docker compose up` finishes, the database is automatically seeded with realistic demo data. You can log in immediately:

| Field | Value |
|-------|-------|
| Username | `sayadihedi145` |
| Password | `password123` |

Once logged in you will see:
- **10 projects** with time budgets (e.g., Final Project has an 80-hour budget)
- **Tasks** already logged for earlier this week
- **Weekly Goals** ring on the dashboard (target: 40 hours/week)
- **Project Sharing** - some projects are shared with a second demo user so the Team Dashboard tab is populated

> The backend may take ~30 seconds to start on first run because it builds the Docker image and executes the seed script. The frontend will be available once the backend health check passes.

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `postgres` | 5432 | PostgreSQL database |
| `pgadmin` | 5050 | pgAdmin database management UI |
| `backend` | 8080 | Spring Boot REST API |
| `frontend` | 3000 | React SPA (nginx) |

## Development Setup

### Backend

```bash
cd backend

# Run tests
./mvnw test

# Run with coverage report
./mvnw test jacoco:report

# Run tests with coverage enforcement (JaCoCo threshold is 90%)
./mvnw verify

# Start locally (requires PostgreSQL on localhost:5432 and a .env file)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

When running locally without Docker, copy `.env.example` to `.env` in the project root and set your `JWT_SECRET`.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Run linter
npm run lint

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

## Technology Stack

### Backend
- **Java 21** with Spring Boot 3.4.0
- **Spring Security** with JWT authentication
- **Spring Data JPA** with PostgreSQL
- **Testcontainers** for integration testing
- **JaCoCo** for coverage reporting

### Frontend
- **React 19** with TypeScript
- **Vite** build tool
- **React Router** for SPA navigation
- **TanStack Query** for server state management
- **Axios** for API communication

### Infrastructure
- **Docker Compose** for local deployment
- **PostgreSQL 16** database
- **pgAdmin** for database administration
- **Nginx** for frontend static file serving

## API Overview

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Authenticate and receive JWT
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/password` - Change password
- `PUT /api/auth/timezone` - Update preferred time zone
- `GET /api/auth/me/goal` - Get weekly goal progress
- `PUT /api/auth/me/goal` - Set weekly target hours

### Projects
- `GET /api/projects` - List all projects with subprojects
- `POST /api/projects` - Create project (optionally with parent)
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `POST /api/projects/{id}/share` - Share project with a user
- `DELETE /api/projects/{id}/share/{userId}` - Remove user from project
- `GET /api/projects/{id}/members` - List project members
- `GET /api/projects/{id}/budget` - Get budget vs spent time
- `GET /api/projects/{id}/team` - Get team contributions

### Tasks / Time Tracking
- `GET /api/tasks` - List all tasks
- `POST /api/tasks/start` - Start a new timer
- `POST /api/tasks/{id}/stop` - Stop running timer
- `GET /api/tasks/active` - Get currently running task
- `POST /api/tasks` - Create manual entry
- `PUT /api/tasks/{id}` - Edit task (including times)
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/tasks/overview?period=today|week|month` - Time overview
- `GET /api/tasks/projects/{id}/time` - Total time for project
- `GET /api/tasks/projects/{id}/tasks` - List tasks for a project
- `GET /api/tasks/projects/{id}/export` - Export tasks as CSV

## Testing

### Backend Tests
```bash
cd backend
./mvnw test              # Run all tests (unit + integration)
./mvnw test jacoco:report # Generate coverage report
./mvnw verify            # Run tests + enforce JaCoCo threshold (90%)
```

Backend tests include unit tests (service layer, security filters, exception handling) and integration tests (controllers with Testcontainers). They run together in CI.

### Frontend Tests
```bash
cd frontend
npm run test             # Run unit tests (Vitest)
npm run test:coverage    # Run tests with coverage report
```

Frontend test coverage exceeds all thresholds:
- **Statements:** 93.89%
- **Branches:** 81.26%
- **Functions:** 92.27%
- **Lines:** 95.57%

### E2E Tests
```bash
cd frontend
npx playwright test      # Run Playwright end-to-end tests
```

## Project Structure

```
.
├── backend/          # Spring Boot application
│   ├── src/main/
│   │   ├── java/     # Controllers, services, entities, security
│   │   └── resources/# application.yml
│   └── src/test/     # Unit and integration tests
├── frontend/         # React SPA
│   ├── src/
│   │   ├── api/      # API hooks (TanStack Query + Axios)
│   │   ├── components/# Reusable UI components
│   │   ├── hooks/    # Auth context
│   │   └── pages/    # Page-level components
│   └── src/test/     # Frontend tests
├── docker-compose.yml # Docker orchestration
└── README.md
```

## License

Individual academic project for University of Passau.
