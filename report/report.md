# Time Tracking Application - Final Project Report

**Hedi Sayadi**

Summer Semester 2026

---

## Introduction

This report is about the time tracking app I built for the AI-Driven Software Development course at the University of Passau. The whole thing is a full-stack web application with a Spring Boot backend, a React frontend, and PostgreSQL for the database. Everything runs inside Docker containers, so it is easy to set up on any machine.

The interesting part of this project is that I did not write most of the code myself. I used an AI coding assistant called Kilo (powered by the kimi-k2.6 model) that lives inside VS Code. It can read files, write code, and run commands. In this report, I will explain how the system is built, how I used the AI, what went well, and honestly, what did not go so well.

---

## System Architecture and Design Decisions

### Overview

The application follows a typical three-tier architecture. The client tier is a React single-page application that runs in the browser. The middle tier is a Spring Boot REST API that handles business logic, authentication, and database access. The data tier is PostgreSQL, which stores users, projects, tasks, and time entries.

Communication between frontend and backend happens over HTTP. The backend exposes JSON endpoints under `/api`, and the frontend calls them using TanStack Query (formerly React Query), which handles caching, loading states, and automatic refetching. This means I do not have to write a lot of boilerplate for data fetching.

I also spent time thinking about how to distribute the project so it stays maintainable. On the backend, I split the code into layers: controllers handle HTTP requests, services contain the business logic, and repositories talk to the database. This separation means I can change how a feature works internally without touching the API contract. For example, when I switched from JPQL aggregation to Java streams for the Team Dashboard, the controller and frontend did not need any changes because the service layer still returned the same DTO.

On the frontend, I organized components by responsibility. Shared UI pieces like MetricCard and the project dropdown live in the components folder. Page-level components live in pages. API calls are isolated in the api folder using TanStack Query hooks. This structure avoids duplication: if two pages need the same data, they both use the same hook instead of copying fetch logic. I also made sure the timer logic is centralized in TimerCard rather than scattered across different pages, so there is only one place where the stopwatch state lives.

### The Stack

On the server side, I use Spring Boot with Java 21. It exposes REST APIs and handles authentication with JWT tokens. The frontend is React 19 with TypeScript, built with Vite. For styling, I just used plain CSS with CSS Modules. No heavy UI framework like Material UI or Tailwind, because I wanted to keep things simple and understand the styling myself. The database is PostgreSQL 16, and Hibernate handles the schema with `ddl-auto: update`, so I did not need to write migration scripts manually.

All of this is wrapped in Docker Compose. You run `docker compose up` and you get four containers: the database, pgAdmin, the backend, and the frontend served by nginx. I chose this setup because it keeps the development environment identical to production. If it works on my laptop in Docker, it will work on the university server too.

### Some Decisions I Made Along the Way

One architectural decision I faced early on was whether to store derived values in the database or compute them in application code. For example, task durations could be stored as a column or calculated from start and end timestamps. I chose to compute them in Java rather than storing a separate duration field. The benefit is that I do not need to write any update logic. The duration is always derived from the source timestamps, so there is no risk of forgetting to recalculate it when data changes. The downside is that you lose the ability to aggregate or filter by that value using standard database queries. This trade-off became important later when building reporting features, because we had to compute aggregates in the application layer instead of letting the database do the work.

Another decision was how to handle integration testing. I chose Testcontainers, which spins up a real PostgreSQL database inside a Docker container during tests. This means the integration tests run against the same database engine we use in production, rather than an in-memory database like H2. The tests are slower, but they catch issues that H2 would miss, like database-specific syntax or schema mismatches.

Finally, for project sharing, I decided to use a membership table rather than copying or duplicating tasks. When a user invites someone to their project, we just create a link in a join table. This keeps the data normalized and avoids the nightmare of keeping duplicated rows in sync across multiple users.

---

## How I Used the AI

The tool I used was Kilo, an agent inside VS Code. It is not just a chatbot. It can actually edit files, run terminal commands, and execute tests. I would plan the implementation myself, sketch out the architecture, and then ask the AI to create the files, wire everything together, and run the build.

Before settling on Kilo, I actually started with GitHub Copilot from the student pack because it was free. At first it worked fine and I did not even reach 20% of my tokens. But starting from June, I noticed they changed the pricing and it increased a lot. I finished my tokens in one day. So I switched to normal LLMs in the browser. That approach was functional, but they slowed me down because they do not have access to the files in my codebase. This is not a small project, so I kept having to manually copy code back and forth and adjust what the AI proposed to fit my existing code, especially in the frontend.

So I did some research about other models. I looked at benchmarks and pricing, and came across kimi-k2.6. Comparing it to Claude or other expensive models, the price was much better and the performance was more than enough for what I needed. That is how I ended up using Kilo with the kimi-k2.6 model.

Here is what I typically asked it to do:

- **Implement features from GitHub issues.** For example, I would first create the necessary files myself and write a plan or description for the feature, explaining how it should be modeled. Then I would ask the AI to implement it for the issue. It would add the backend endpoints, the DTOs, the frontend components, and update the pages.
- **Debug errors.** When the backend threw a 500 error or tests failed, I pasted the stack trace and it traced the bug back to the source file.
- **Refactor.** Renaming variables across multiple files, splitting large components, cleaning up CSS. The AI handled the mechanical parts.

I also want to mention that the AI helped me format better issue descriptions. In the beginning I created them myself and they were a bit short and not very well documented with details. After that I started using the AI to elaborate the issue descriptions, and then I created them in GitHub. This made the issues much clearer and easier to track. It also turned out to be really important for prompting. When the issue has a clear description with acceptance criteria and a rough plan, the AI does a much better job implementing it. With vague issues, it tends to guess or miss parts of the feature.

---

## Where the AI Helped a Lot

### End-to-End Feature Implementation

The best thing about the AI was how fast it could implement a whole feature across the entire stack. Take the Weekly Goals feature (Issue #50). I first sketched out what I wanted: a way for users to set a weekly hour target, and a circular progress ring on the dashboard. I created the issue with a plan, then asked the AI to implement it. It added the database column, the backend endpoints, the React component with the SVG ring, and wired it into the dashboard and settings. I reviewed each part, tested it in the browser, and we iterated on the styling together. I had to adjust the ring colors and positioning after seeing it rendered, because the AI cannot judge what looks good visually.

### Debugging with Context

The AI is really good at reading error logs and tracing them back to the exact line of code. When frontend tests failed because of a missing dependency, it identified the gap and added the package. When the backend threw compilation errors, it usually spotted the problem faster than I could.

### Code Style and Structure

Early in the project, I set up the conventions myself. I decided to use CSS Modules for scoped styling, TanStack Query for server state management, and Lombok to reduce boilerplate in Java. Once these patterns were established, the AI followed them automatically when adding new files. I still had to review each change to make sure it fit the existing structure, but I did not have to repeatedly explain the same conventions.

---

## Where the AI Did Not Work Well

### Database Query Limitations

The AI often tries to solve data aggregation problems with database queries, even when the data lives in application code rather than the database schema. I ran into this multiple times. The AI would suggest SQL or JPQL aggregates for fields that are computed in Java methods. It took a few rounds of back and forth before I realized I had to explicitly redirect it toward in-memory processing. Once I gave that direction, it handled the implementation fine. But it does not naturally check whether a field is a database column or just a computed getter.

### CI Pipeline Assumptions

The AI set up GitHub Actions assuming the self-hosted runner had Docker installed, because we use Testcontainers for integration tests. The pipeline failed repeatedly. At first we thought the university runner did not have Docker at all, so we disabled the integration tests in CI and only ran unit tests. Later, we discovered that Docker IS installed on the runner (version 29.6.0), but the Docker daemon requires API version 1.40 or higher. The Testcontainers library we use (via Spring Boot 3.4.0) bundles an older docker-java client that defaults to API 1.32. This version mismatch causes the connection to fail.

We tried several fixes that did not work: upgrading Testcontainers from 1.20.4 to 1.20.6, forcing docker-java 3.5.1 via dependencyManagement, and setting the DOCKER_API_VERSION environment variable. Testcontainers 1.20.x still sends API version 1.32 in the request header regardless of the underlying docker-java version.

We also discovered why we could not simply switch to GitHub-hosted runners (ubuntu-latest) like my previous todo app project did. The final project repository is under the university GitHub organization (se2p-classrooms), which has exceeded its GitHub Actions minutes budget. GitHub-hosted runners are blocked by a billing error. This leaves the self-hosted runner as the only option.

The breakthrough came from re-reading the professor's recommendation to Docker-ize as much of the pipeline as possible to ensure a known set of dependencies. The key insight was that the Docker CLI negotiates the API version automatically, while the docker-java library inside Testcontainers does not. So instead of fighting Testcontainers, we changed the CI pipeline to start PostgreSQL ourselves using `docker run`, and point the tests at that external database. To make this work we added a `@ConditionalOnProperty` annotation to the `TestcontainersConfiguration` bean so it can be disabled in CI while still working locally with Docker Desktop. The CI now runs all 22 tests (including the full integration suite), and local development still uses Testcontainers transparently. The lesson here is that when a library cannot talk to your infrastructure, the simplest fix is often to bypass the library and manage the dependency yourself.

### Visual Validation

The AI cannot see the UI it generates. It writes CSS, compiles the frontend, and reports success. But whether something is actually visible, aligned, or color-matched to the rest of the app is something I had to verify manually. Several times I opened the browser and found elements missing or styled wrong because the AI used values that looked correct in code but did not match the existing design. I had to take screenshots and describe the visual problems to get fixes.

---

## Missing AI Tools

There are two tools I wish existed during this project.

First, a visual regression testing agent. Something that can automatically take screenshots of the UI after every change and flag visual bugs like invisible elements, misaligned text, or broken layouts. Tools like Chromatic exist but they need CI setup and paid accounts. A lightweight local version that works during development would be really helpful.

Second, a database schema diff analyzer. When I added new columns or entities, I had to manually check that the seed data, test data, and Hibernate mappings were all in sync. A tool that flags inconsistencies between the entity classes and the SQL inserts would prevent runtime errors.

---

## Custom Features

As a Master student, I had to implement three custom features. Here is a quick summary.

### Time Budgets (Issue #42, PR #43)

You can set an hour budget per project. The dashboard and project detail page show a progress bar that fills up as you log time. If you go over budget, the bar turns red. The backend computes the spent hours by summing task durations in Java.

### Team Dashboard (Issue #44, PR #45, Fix PR #47)

Shared projects have a Team tab that shows each member time contribution for the current week. It uses color-coded progress bars. The initial implementation crashed because of the JPQL aggregation issue I mentioned above. PR #47 fixed it by replacing the broken query with in-memory grouping.

### Weekly Goals (Issue #50, PR #51)

Users set a personal weekly hour target in Settings. The dashboard shows a circular progress ring for the current week (Monday to Sunday). The ring is color-coded: blue under 80 percent, orange between 80 and 100 percent, and green when you exceed your goal.

---

## Closing Thoughts

Using an AI agent for this project was a mixed experience, but overall very positive. It let me build features I probably could not have finished in time if I wrote every line manually. At the same time, it made mistakes that a human developer might not make, especially around database queries and visual UI. I learned that AI works best when you treat it as a fast but imperfect coworker. You still need to understand the architecture, review the code, and test the UI yourself. The AI writes the code, but you own the decisions.
