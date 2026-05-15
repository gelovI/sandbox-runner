FROM eclipse-temurin:21-jdk

RUN apt-get update \
    && apt-get install -y curl unzip \
    && curl -L -o kotlin-compiler.zip https://github.com/JetBrains/kotlin/releases/download/v2.0.21/kotlin-compiler-2.0.21.zip \
    && unzip kotlin-compiler.zip -d /opt \
    && rm kotlin-compiler.zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV PATH="/opt/kotlinc/bin:${PATH}"

WORKDIR /app