# Sandbox Runner

Eine moderne verteilte Multi-Language-Code-Execution-Plattform mit Kotlin, Docker, Redis, PostgreSQL, React und Monaco Editor.

---

# Übersicht

Sandbox Runner ist eine containerisierte Distributed-Code-Execution-Plattform, die es ermöglicht, untrusted Code sicher in isolierten Docker-Containern auszuführen.

Das Projekt wurde als Full-Stack- und Platform-Engineering-Showcase entwickelt mit Fokus auf:

- Kotlin Backend Architektur
- Docker Container Orchestrierung
- Sichere Sandbox-Execution
- Asynchrone Worker-Systeme
- Redis Queue Architektur
- PostgreSQL Persistence
- Modernes React Frontend
- Infrastructure Engineering
- Resource Isolation
- Observability
- Horizontal Scaling
- Developer Experience

---

# Features

## Multi-Language Code Execution

Unterstützte Sprachen:

- Python
- JavaScript
- Kotlin
- Java
- Go

Jede Sprache läuft in einem isolierten Docker-Container.

---

## Asynchrone Distributed Execution

Runs werden nicht synchron im HTTP-Request ausgeführt.

Execution Flow:

```text
Frontend
    ↓
Ktor API
    ↓
Redis Queue
    ↓
Worker Pool
    ↓
Docker Runtime Container
```

Features:

- Redis-basierte Queue
- Horizontale Worker-Skalierung
- Asynchrone Verarbeitung
- Retry-System
- Dead Letter Queue
- Live Streaming
- Cancellation Support

---

## Worker-System

Die Plattform verwendet ein separates Worker-System.

Worker übernehmen:

- Queue Consumption
- Docker Runtime Execution
- stdout/stderr Streaming
- Retry Handling
- Container Cleanup
- Cancellation
- Active Container Tracking
- Heartbeats

Mehrere Worker können parallel laufen:

```bash
docker compose up --build --scale worker=3
```

---

## Live Execution Streaming

Das Frontend verwendet Server-Sent Events (SSE) für Live-Updates.

Unterstützte Events:

- status
- stdout
- stderr
- finished

Dadurch entsteht terminalähnliches Live-Streaming direkt im Browser.

---

## Retry + Dead Letter Queue

Fehlgeschlagene Worker-Ausführungen werden automatisch erneut versucht.

Retry Flow:

```text
Worker Failure
    ↓
Retry 1
    ↓
Retry 2
    ↓
Retry 3
    ↓
DEAD_LETTER
```

Dead Letter Runs bleiben persistent für Debugging und Analyse.

---

## Job Cancellation

Laufende Executions können live abgebrochen werden.

Cancellation Flow:

```text
User clicks Cancel
        ↓
Status → CANCEL_REQUESTED
        ↓
Worker erkennt Cancellation
        ↓
Docker Container wird beendet
        ↓
Status → CANCELLED
```

---

## Active Container Tracking

Jeder Runtime-Container erhält einen deterministischen Namen:

```text
sandbox-run-<run-id>
```

Dadurch sind möglich:

- gezieltes Container-Killen
- robustes Cleanup
- bessere Observability
- sichere Cancellation

---

## Sichere Sandbox-Ausführung

Jede Ausführung läuft mit:

- deaktiviertem Netzwerk
- CPU-Limits
- Memory-Limits
- PID-Limits
- ulimits
- entfernten Linux Capabilities
- no-new-privileges Security Option
- read-only Root Filesystem (interpreted runtimes)
- isoliertem tmpfs
- non-root Runtime User
- temporären isolierten Containern

Beispiel:

```bash
--network none
--memory 128m
--cpus 1
--pids-limit 64
--cap-drop ALL
--security-opt no-new-privileges
--read-only
--tmpfs /tmp
--user 1000:1000
```

---

## Sprachspezifische Runtime-Profile

| Sprache | Memory | Timeout | PID-Limit | Security Profil |
|---|---|---|---|---|
| Python | 128 MB | 5 Sekunden | 64 | read-only + non-root |
| JavaScript | 128 MB | 5 Sekunden | 64 | read-only + non-root |
| Go | 256 MB | 15 Sekunden | 128 | compiled runtime |
| Java | 512 MB | 20 Sekunden | 128 | compiled runtime |
| Kotlin | 1024 MB | 45 Sekunden | 128 | compiled runtime |

---

# Modernes Full-Stack Dashboard

## Frontend Features

- Monaco Editor
- Live Run History
- Run Details
- Worker Dashboard
- Queue Statistics
- Live stdout/stderr Streaming
- Multi-Language Execution
- Status-Indikatoren
- Responsive modernes UI
- Live Worker Observability

---

## Persistente Speicherung

Alle Executions werden in PostgreSQL gespeichert:

- Execution Metadata
- Runtime Statistics
- stdout/stderr Logs
- Exit Codes
- Execution Duration
- Retry Counts
- Worker Assignment
- Container Names
- Language Distribution
- Queue Status

---

# Worker Observability

Die Plattform enthält ein integriertes Observability-System.

Verfügbare Metriken:

- aktive Worker
- aktive Jobs
- Queue Depth
- Dead Letter Count
- Worker Heartbeats
- Run Status Distribution

API Endpoints:

```text
/api/workers
/api/queue/stats
```

---

# Architektur

```text
┌──────────────────────────────┐
│         Frontend             │
│ React + TypeScript + Vite    │
│ Monaco Editor + Tailwind     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         Backend API          │
│       Kotlin + Ktor          │
│ Clean Architecture Layers    │
└──────────────┬───────────────┘
               │
               ├───────────────► PostgreSQL
               │                 Flyway Migrationen
               │
               ▼
┌──────────────────────────────┐
│         Redis Queue          │
│ Async Distributed Execution  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         Worker Pool          │
│ Retry + DLQ + Streaming      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Docker Sandbox          │
│  Isolated Runtime Containers │
└──────────────────────────────┘
```

---

# Tech Stack

## Backend

- Kotlin
- Ktor
- Exposed ORM
- Flyway
- PostgreSQL
- Redis
- Docker CLI Integration

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Monaco Editor
- Lucide Icons
- Server-Sent Events (SSE)

## Infrastruktur

- Docker Desktop
- Docker Compose
- Redis
- Nginx
- Multi-Container-Orchestrierung
- Distributed Worker Architecture

---

# Projektstruktur

```text
sandbox-runner/
├── backend/
│   ├── api/
│   ├── application/
│   ├── config/
│   ├── domain/
│   ├── infrastructure/
│   └── resources/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker/
│   └── runners/
│       └── kotlin/
│           └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

# API Endpoints

## Code ausführen

```http
POST /api/runs
```

Beispiel:

```json
{
  "language": "python",
  "code": "print('Hallo Welt')"
}
```

---

## Runs abrufen

```http
GET /api/runs
```

---

## Run Details abrufen

```http
GET /api/runs/{id}
```

---

## Live Execution Events

```http
GET /api/runs/{id}/events
```

---

## Run abbrechen

```http
POST /api/runs/{id}/cancel
```

---

## Worker Metrics

```http
GET /api/workers
```

```http
GET /api/queue/stats
```

---

# Projekt starten

## Voraussetzungen

- Docker Desktop
- Node.js 22+
- Java 21

---

## Gesamte Plattform starten

```bash
docker compose up --build --scale worker=3
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:8080
```

---

# Beispiel-Ausführungen

## Python

```python
print("Hello from Python")
```

---

## Kotlin

```kotlin
fun main() {
    println("Hello from Kotlin")
}
```

---

## Go

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello from Go")
}
```

---

# Sicherheitskonzept

Das Sandbox-System isoliert jede Ausführung bewusst vollständig.

## Isolation Strategy

- Kein gemeinsamer Runtime-State
- Keine Netzwerkverbindung
- Container pro Execution
- Temporäre isolierte Workspaces
- Runtime-Limits
- Security-Hardening
- Prozess-Isolation
- Non-root Runtime User
- Controlled tmpfs Execution

---

# Plattform-Ziele

Das Projekt fokussiert sich auf:

- Distributed Execution Systems
- Sandbox Isolation
- Platform Engineering
- Async Architectures
- Secure Runtime Execution
- Observability
- Worker-Orchestrierung
- Runtime Resource Isolation

---

# Mögliche zukünftige Erweiterungen

## Infrastruktur

- Kubernetes Deployment
- Horizontal Pod Autoscaling
- Distributed Scheduling
- Cloud Deployment

## Observability

- Prometheus Metrics
- Grafana Dashboards
- Structured Logging
- Alerting

## Security

- seccomp Profiles
- AppArmor
- gVisor
- Firecracker MicroVMs
- Rootless Docker

## Platform Features

- Interactive Terminal
- stdin Streaming
- WebSocket Sessions
- Multi-File Projects
- Persistent Sessions
- File Explorer

---

# Projektfokus

Sandbox Runner wurde als fortgeschrittenes Full-Stack- und Platform-Engineering-Projekt entwickelt, um moderne verteilte Runtime-Architekturen, sichere Sandbox-Ausführung und asynchrone Worker-Systeme zu demonstrieren.

