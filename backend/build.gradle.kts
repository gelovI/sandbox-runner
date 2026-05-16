import org.gradle.jvm.application.tasks.CreateStartScripts
import org.gradle.api.file.DuplicatesStrategy

plugins {
    kotlin("jvm") version "2.0.21"
    application
    id("io.ktor.plugin") version "3.0.1"
    kotlin("plugin.serialization") version "2.0.21"
}

group = "com.ivan"
version = "0.1.0"

application {
    mainClass.set("com.ivan.sandbox.app.ApplicationKt")
}

kotlin {
    jvmToolchain(21)
}

dependencies {
    implementation("io.ktor:ktor-server-core-jvm")
    implementation("io.ktor:ktor-server-netty-jvm")
    implementation("io.ktor:ktor-server-content-negotiation-jvm")
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm")
    implementation("io.ktor:ktor-server-call-logging-jvm")
    implementation("ch.qos.logback:logback-classic:1.5.12")

    implementation("com.github.docker-java:docker-java-core:3.4.0")
    implementation("com.github.docker-java:docker-java-transport-httpclient5:3.4.0")

    testImplementation("io.ktor:ktor-server-test-host-jvm")
    testImplementation(kotlin("test"))

    implementation("io.ktor:ktor-server-status-pages-jvm")

    implementation("org.jetbrains.exposed:exposed-core:0.56.0")
    implementation("org.jetbrains.exposed:exposed-dao:0.56.0")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.56.0")

    implementation("org.postgresql:postgresql:42.7.4")
    implementation("org.flywaydb:flyway-core:10.20.1")
    implementation("org.flywaydb:flyway-database-postgresql:10.20.1")

    implementation("org.jetbrains.exposed:exposed-java-time:0.56.0")

    implementation("redis.clients:jedis:5.2.0")

    implementation("io.ktor:ktor-server-sse-jvm")
}

tasks.register<CreateStartScripts>("workerStartScripts") {
    mainClass.set("com.ivan.sandbox.app.WorkerApplicationKt")
    applicationName = "sandbox-worker"
    outputDir = file("$buildDir/scripts")
    classpath = tasks.named<CreateStartScripts>("startScripts").get().classpath
}

tasks.named("installDist") {
    dependsOn("workerStartScripts")
}

tasks.named<Sync>("installDist") {
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE

    from("$buildDir/scripts/sandbox-worker") {
        into("bin")
    }
}