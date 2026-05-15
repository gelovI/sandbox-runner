# Sandbox Runner

Eine moderne Multi-Language-Code-Execution-Plattform mit Kotlin, Docker, PostgreSQL, React und Monaco Editor.
--

# Übersicht

Sandbox Runner ist eine containerisierte Code-Execution-Plattform, die es ermöglicht, Code sicher in isolierten Docker-Containern auszuführen.

Das Projekt wurde als Full-Stack-Engineering-Showcase entwickelt mit Fokus auf:

- Kotlin Backend Architektur
- Docker Container Orchestrierung
- Sichere Sandbox-Execution
- PostgreSQL Persistence
- Modernes React Frontend
- Infrastructure Engineering
- Resource Isolation
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

## Sichere Sandbox-Ausführung

Jede Ausführung läuft mit:

- deaktiviertem Netzwerk
- CPU-Limits
- Memory-Limits
- PID-Limits
- entfernten Linux Capabilities
- no-new-privileges Security Option
- temporären isolierten Containern

Beispiel:

```bash
--network none
--memory 128m
--cpus 1
--pids-limit 64
--cap-drop ALL
--security-opt no-new-privileges
```

## Sprachspezifische Runtime-Profile

| Sprache | Memory | Timeout | PID-Limit |
|---|---|---|---|
| Python | 128 MB | 5 Sekunden | 64 |
| JavaScript | 128 MB | 5 Sekunden | 64 |
| Go | 256 MB | 15 Sekunden | 128 |
| Java | 512 MB | 20 Sekunden | 128 |
| Kotlin | 1024 MB | 45 Sekunden | 128 |

# Modernes Full-Stack Dashboard

## Frontend Features:

- Monaco Editor
- Run History
- Run Details
- Live Statistics
- Multi-Language Execution
- Status-Indikatoren
- Responsives modernes UI
- Persistente Speicherung

# Alle Executions werden in PostgreSQL gespeichert:

- Execution Metadata
- Runtime Statistics
- stdout/stderr Logs
- Exit Codes
- Execution Duration
- Language Distribution

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
│      Docker Sandbox          │
│  Isolated Runtime Containers │
└──────────────────────────────┘
```

# Tech Stack
## Backend
- Kotlin
- Ktor
- Exposed ORM
- Flyway
- PostgreSQL
- Docker CLI Integration
## Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Monaco Editor
- Lucide Icons
## Infrastruktur
- Docker Desktop
- Docker Compose
- Nginx
- Multi-Container-Orchestrierung

  
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
# API Endpoints
## Code ausführen
```
POST /api/runs
```

Beispiel:
```
{
  "language": "python",
  "code": "print('Hallo Welt')"
}
```

## Runs abrufen
```
GET /api/runs
```
Run Details abrufen
GET /api/runs/{id}
Plattform-Statistiken
GET /api/stats
Projekt starten
Voraussetzungen
Docker Desktop
Node.js 22+
Java 21
Gesamte Plattform starten
docker compose up --build

Frontend:

http://localhost:3000

Backend:

http://localhost:8080
Beispiel-Ausführungen
Python
print("Hello from Python")
Kotlin
fun main() {
    println("Hello from Kotlin")
}
Go
package main

import "fmt"

func main() {
    fmt.Println("Hello from Go")
}
Sicherheitskonzept

Das Sandbox-System isoliert jede Ausführung bewusst vollständig.

Isolation Strategy
Kein gemeinsamer Runtime-State
Kein Host-Netzwerk
Temporäre Execution-Container
Ressourcen-Limits via Docker
Eingeschränkte Linux Capabilities
Kontrollierte isolierte Execution
Hinweis

Dieses Projekt dient als Engineering-Showcase und Lernplattform.
Es ersetzt keine vollständig gehärteten produktiven VM-/Container-Isolation-Systeme.

Datenbankschema

Haupttabelle:

code_runs

Speichert:

Execution ID
Sprache
Code
stdout
stderr
Execution Status
Runtime Duration
Timestamps
Frontend Dashboard

Features:

Monaco-basierter Editor
Scrollbare Run History
Runtime Statistics
Execution Details
Modernes Dark UI
Responsives Layout
Zukunftsideen

Mögliche Erweiterungen:

WebSocket Live Output Streaming
Kubernetes Deployment
GitHub OAuth Authentication
Multi-User Workspaces
Distributed Execution Nodes
Queue-basierte Worker
Rate Limiting
Audit Logging
WASM Runtime Support
Warum dieses Projekt?

Dieses Projekt demonstriert:

Backend Architektur
Docker Orchestrierung
Infrastructure Engineering
Full-Stack Development
Sichere Sandbox-Ausführung
Datenbank-Persistence
Modernes Frontend Engineering
Production-Oriented Thinking
Screenshots
Dashboard

Füge hier Screenshots ein

Execution Details

Füge hier Screenshots ein

Multi-Language Support

Füge hier Screenshots ein

Autor

Ivan Gelov
