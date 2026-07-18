# TodoFlow Application — Setup & Launch Instructions

> **Note:** This README is hosted in the Time Tracking repository because the Todo App repository (`se2p-classrooms/todo-application-Hedi-Sayadi`) is currently read-only. All setup and launch instructions for the Todo App are provided below.

## Prerequisites

- **Docker & Docker Compose** (only requirement for the Docker path)

For local development without Docker you also need Java 17, Node.js 20+, Maven, and PostgreSQL 16.

## Quick Start (Docker Compose)

Clone the Todo App repository and launch everything with one command:

```bash
git clone https://github.com/se2p-classrooms/todo-application-Hedi-Sayadi.git
cd todo-application-Hedi-Sayadi/todo-app
docker-compose up --build
```

Then open:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api
- **pgAdmin:** http://localhost:5050 (login: `admin.todo@uni-passau.de` / `PgAdmin@2026`)

> No `.env` file is required for the first run. Default credentials are already configured inside `docker-compose.yml`.

### Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `postgres` | 5432 | PostgreSQL database |
| `pgadmin` | 5050 | pgAdmin database management UI |
| `backend` | 8080 | Spring Boot REST API |
| `frontend` | 3000 | React SPA (Vite + serve) |

### Common Commands

```bash
# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Clean rebuild (removes database volumes)
docker-compose down -v
docker-compose up --build
```

## Development Setup

### Backend

```bash
cd todo-app/backend

# Run tests
./mvnw test

# Start locally (requires PostgreSQL on localhost:5432)
./mvnw spring-boot:run
```

### Frontend

```bash
cd todo-app/frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Run linter
npm run lint

# Check formatting
npm run format:check

# Format code
npm run format

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Build for production
npm run build
```

## Technology Stack

### Backend
- **Java 17** with Spring Boot 4.0.6
- **Spring Security** with JWT authentication
- **Spring Data JPA** with PostgreSQL
- **SendGrid SMTP** for email reminders
- **Lombok** for boilerplate reduction
- **Checkstyle** for code style enforcement

### Frontend
- **React 19** with TypeScript
- **Vite** build tool
- **React Router** for SPA navigation
- **@dnd-kit** for drag-and-drop task reordering
- **ESLint + Prettier** for linting and formatting
- **Vitest** for unit testing
- **Playwright** for end-to-end testing

### Infrastructure
- **Docker Compose** for local deployment
- **PostgreSQL 16** database
- **pgAdmin** for database administration

## API Overview

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Authenticate and receive JWT

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Update task (including status toggle)
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/tasks/status/{status}` - Filter by status
- `GET /api/tasks/category/{categoryId}` - Filter by category
- `GET /api/tasks/search?keyword=` - Search tasks

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `DELETE /api/categories/{id}` - Delete category

### Reminders
- `POST /api/reminders` - Schedule reminder
- `DELETE /api/reminders/{id}` - Cancel reminder
- `POST /api/reminders/{id}/send` - Send email immediately

### Health
- `GET /api/health` - Backend health status

## Project Structure

```
todo-app/
├── backend/          # Spring Boot application
│   ├── src/main/
│   │   ├── java/     # Controllers, services, entities, config
│   │   └── resources/# application.yml
│   └── src/test/     # Unit and integration tests
├── frontend/         # React SPA
│   ├── src/
│   │   ├── components/# Reusable UI components
│   │   ├── pages/    # Page-level components
│   │   └── api/      # API client
│   └── src/test/     # Frontend tests
├── docker-compose.yml # Docker orchestration
├── .env              # Environment variables
└── DOCKER.md         # Detailed Docker guide
```

## License

Individual academic project for University of Passau.
