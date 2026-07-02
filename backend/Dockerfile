# Stage 1: Build the application using Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Package the application (skip tests for faster deployment)
RUN mvn clean package -DskipTests

# Stage 2: Create the minimal runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy only the built JAR file from the previous stage
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080 as requested
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
