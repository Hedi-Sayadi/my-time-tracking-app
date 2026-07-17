# Multi-stage build for Spring Boot backend
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B
COPY src ./src
RUN ./mvnw package -Dmaven.test.skip=true -B && \
    mkdir -p target/dependency && \
    (cd target/dependency; jar -xf ../*.jar)

# Production stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/dependency/ .

ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

EXPOSE 8080
ENTRYPOINT ["java", "-cp", ".:BOOT-INF/classes:BOOT-INF/lib/*", "com.hedi.timetracking.backend.BackendApplication"]
