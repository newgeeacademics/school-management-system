# Build stage
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests -q

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY --from=build /app/target/classroom-backend-*.jar app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=production
ENTRYPOINT ["java", "-jar", "app.jar"]
