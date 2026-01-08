# Etapa 1: Build da aplicação (Usando Maven com JDK 21)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copia o pom.xml e baixa as dependências (camada de cache)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copia o código fonte e faz o build
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa 2: Execução (Usando JRE 21)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Copia o .jar gerado na etapa anterior
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]