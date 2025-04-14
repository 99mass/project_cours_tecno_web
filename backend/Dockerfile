# Étape 1 : build avec Maven + JDK 21
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Étape 2 : image finale avec JDK 21 uniquement
FROM eclipse-temurin:21-jdk
WORKDIR /app

# Copie le JAR compilé depuis l'étape précédente
COPY --from=build /app/target/*.jar app.jar

# Expose le port de l’application Spring Boot
EXPOSE 8080

# Lancement de l'application
ENTRYPOINT ["java", "-jar", "app.jar"]
