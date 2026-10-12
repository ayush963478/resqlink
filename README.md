# ResQLink

Real-time coordination platform for discovering, requesting, reserving, and
tracking emergency resources across organizations. Built as a final-year
B.Tech capstone project.

ResQLink is an **information and coordination layer** — it does not replace
emergency services, dispatch authority, or medical decision-making, and it
uses only simulated data in this repository.

## Stack

| Layer      | Technology              |
|------------|--------------------------|
| Frontend   | React + Vite + Tailwind CSS |
| API        | Python + FastAPI + SQLAlchemy |
| Database   | PostgreSQL               |
| Cache/state| Redis                    |
| Messaging  | RabbitMQ                 |
| Workers    | Python (matching, notifications, analytics) |
| Proxy      | Nginx                    |
| Containers | Docker + Docker Compose  |
| CI/CD      | Jenkins                  |

## Project structure

```
resqlink/
├── frontend/          React + Vite app
├── backend/
│   ├── app/
│   │   ├── api/       Route handlers + RBAC dependencies
│   │   ├── core/      Config, DB, security, Redis, RabbitMQ helpers
│   │   ├── models/    SQLAlchemy models
│   │   ├── schemas/   Pydantic request/response schemas
│   │   ├── services/  Matching engine, reservation transaction logic
│   │   ├── workers/   RabbitMQ consumers (matching, notifications, analytics)
│   │   └── main.py
│   └── tests/
├── infrastructure/
│   ├── docker-compose.yml
│   └── nginx/nginx.conf
├── Jenkinsfile
├── .env.example
└── docs/
```

## Running locally with Docker (recommended)

1. Copy the environment file and adjust values if needed:
   ```bash
   cp .env.example .env
   ```
2. From the `infrastructure/` directory, build and start everything:
   ```bash
   cd infrastructure
   docker compose up --build
   ```
3. Visit `http://localhost` for the app. The API is reachable at
   `http://localhost/api`, and RabbitMQ's management UI at
   `http://localhost:15672` (guest/guest, dev only).

The API creates its own tables on startup for this MVP. For a production
deployment, replace `Base.metadata.create_all()` in `app/main.py` with
Alembic migrations (`backend/alembic/`) before schema changes ship.

## Running the backend without Docker

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# requires a running Postgres/Redis/RabbitMQ reachable at the URLs in .env
uvicorn app.main:app --reload
```

Run the matching/notification/analytics workers as separate processes:
```bash
python -m app.workers.matching_worker
python -m app.workers.notification_worker
python -m app.workers.analytics_worker
```

## Running the frontend without Docker

```bash
cd frontend
npm install
npm run dev
```

## Running tests

```bash
cd backend
pytest -q
```

## First-time demo setup

1. Register an **administrator** account, then a **provider** account and a
   **requester** account via `/register`.
2. As administrator, create an organization from the Admin Panel.
3. Manually set the provider user's `organization_id` to that organization
   (via a DB update, or extend the admin API to do this — left as an
   enhancement for the "assign staff to organizations" flow).
4. As provider, add a resource (e.g. type `ambulance`).
5. As requester, submit a request with the same type, then click
   **Find matches**.
6. As provider or coordinator, create a reservation via the `/reservations`
   API for the matched resource and request.
7. Check **Notifications** and **History** as the requester.

## Deploying to a server

See blueprint section 20. In short: a Linux VM, Docker Compose for the
services in `infrastructure/docker-compose.yml`, Nginx in front for
HTTPS/TLS termination, a firewall exposing only 80/443, and Jenkins running
the pipeline in `Jenkinsfile` on pushes to the protected branch.

## What this is not (V1 scope)

- Not a national emergency network or a replacement for 911/emergency
  services.
- Not a medical diagnosis or treatment tool.
- Not an autonomous dispatch system — a human always confirms reservations.
- Uses simulated organizations and resources only; never real
  sensitive emergency or medical data.
