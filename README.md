# Sri BioAesthetics Product QR Application

Full-stack product QR information system with:

- FastAPI backend
- React frontend
- Docker PostgreSQL database
- Nginx frontend container that proxies `/api` to the backend

## Run Everything With Docker

From the project root:

```bash
docker compose up --build
```

Open:

```text
http://localhost:5173
```

Useful endpoints:

```text
Frontend: http://localhost:5173
Backend health: http://localhost:8000/health
Backend docs: http://localhost:8000/docs
Postgres: localhost:5432
```

## Database

Docker starts PostgreSQL with these defaults:

```text
Database: products
User: postgres
Password: postgres
Port: 5432
```

The first time the database volume is created, Docker runs:

```text
docker/postgres/init/001_schema_seed.sql
```

That file creates all required tables and inserts the initial product, detail, and ingredient data.

## Environment Overrides

For CI/CD, set these variables in your pipeline or server environment if you want different values:

```bash
POSTGRES_DB=products
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
BACKEND_PORT=8000
FRONTEND_PORT=5173
REFERRAL_ID=909090
AUTH_SECRET_KEY=change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=720
```

## Reset Local Docker Database

This deletes the local Docker Postgres volume and recreates the seeded database:

```bash
docker compose down -v
docker compose up --build
```
