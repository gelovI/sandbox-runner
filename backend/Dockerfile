FROM gradle:8.10-jdk21 AS build

WORKDIR /app

COPY build.gradle.kts settings.gradle.kts ./
COPY src ./src

RUN gradle installDist --no-daemon

FROM docker:27-cli AS docker-cli

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=docker-cli /usr/local/bin/docker /usr/local/bin/docker
COPY --from=build /app/build/install/sandbox-backend ./

EXPOSE 8080

CMD ["bin/sandbox-backend"]