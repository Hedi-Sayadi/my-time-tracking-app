# Time Tracking Application

A full-stack time tracking web application for individuals (students, freelancers, researchers) to track time spent on lectures, seminars, projects, and other activities.

## Prerequisites

- **Java JDK 21** (or 25)
- **Node.js 24+** (LTS)
- **Maven** (or use the included `./mvnw` wrapper)
- **Docker & Docker Compose** (for containerized deployment)
- **PostgreSQL 16** (if running locally without Docker)

## Quick Start (Docker Compose)

The fastest way to run the entire application with database and admin UI:

```bash
# Clone the repository
git clone <repo-url>
cd final-project-Hedi-Sayadi

# Start all services
docker compose up --build

# Access the applications:
# Frontend:     http://localhost:3000
# Backend API:  http://localhost:8080/api
# pgAdmin:      http://localhost:5050 (admin@timetracking.local / admin)
```

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `postgres` | 5432 | PostgreSQL database |
| `pgadmin` | 5050 | pgAdmin database management UI |
| `backend` | 8080 | Spring Boot REST API |
| `frontend` | 3000 | React SPA (nginx) |

### Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```bash
JWT_SECRET=your-secret-key-here-min-32-chars-long
JWT_EXPIRATION_MS=86400000
```

## Development Setup

### Backend

```bash
cd backend

# Run tests
./mvnw test

# Run with coverage (enforces 90% line coverage)
./mvnw verify

# Start locally (requires PostgreSQL on localhost:5432)
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

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
- **JaCoCo** for coverage (90% line minimum)

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
- `POST /api/auth/register` — Create new account
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Get current user info
- `PUT /api/auth/password` — Change password

### Projects
- `GET /api/projects` — List all projects with subprojects
- `POST /api/projects` — Create project (optionally with parent)
- `PUT /api/projects/{id}` — Update project
- `DELETE /api/projects/{id}` — Delete project

### Tasks / Time Tracking
- `GET /api/tasks` — List all tasks
- `POST /api/tasks/start` — Start a new timer
- `POST /api/tasks/{id}/stop` — Stop running timer
- `GET /api/tasks/active` — Get currently running task
- `POST /api/tasks` — Create manual entry
- `PUT /api/tasks/{id}` — Edit task (including times)
- `DELETE /api/tasks/{id}` — Delete task
- `GET /api/tasks/overview?period=today|week|month` — Time overview
- `GET /api/tasks/projects/{id}/time` — Total time for project

## Testing

### Backend Tests
```bash
cd backend
./mvnw test              # Unit tests
./mvnw verify            # Integration tests + coverage
```

### Frontend Tests
```bash
cd frontend
npm run test             # Unit tests (Vitest)
npm run test:coverage    # With coverage report
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
