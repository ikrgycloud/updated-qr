# QR Product Backend

FastAPI backend for listing products, fetching full product details, generating QR payloads, and browsing QR history.

## Project Structure

```text
backend/
  app/
    core/
    models/
    routers/
    schemas/
    services/
    main.py
  requirements.txt
  README.md
```

## APIs

- `GET /api/products` - list all product names
- `GET /api/products/{product_id}` - fetch product details, ingredient rows, and QR payload in one response
- `POST /api/qr/generate` - generate and store a QR payload in history
- `GET /api/qr/history` - fetch QR generation history

## Run Locally

### Full Stack Docker Run

From the project root:

```bash
docker compose up --build
```

Backend will run at:

```text
http://localhost:8000
```

### Backend Only Development

1. Start the Docker database from the project root:

```bash
docker compose up db
```

2. Create and activate a virtual environment.
3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Start the server from the `backend` folder:

```bash
uvicorn app.main:app --reload
```

5. Open:

- Backend root: `<your-backend-url>/`
- Swagger UI: `<your-backend-url>/docs`
- ReDoc: `<your-backend-url>/redoc`

## Data Source

Docker PostgreSQL is the default database. On the first run, `../docker/postgres/init/001_schema_seed.sql` creates the tables and inserts the initial product data.

Empty product detail values are returned as empty strings in the product detail response.

## Frontend

The standalone React + Vite frontend lives in `../forntend`.

## Environment

Configure backend values in `.env`:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/products
CORS_ORIGINS=*
REFERRAL_ID=909090
AUTH_SECRET_KEY=
ACCESS_TOKEN_EXPIRE_MINUTES=720
```

## Example Request

Generate a QR payload for a product id that already exists in your database:

```bash
curl -X POST "<your-backend-url>/api/qr/generate" \
  -H "Content-Type: application/json" \
  -d "{\"product_id\": 1, \"request_source\": \"frontend-scan\"}"
```

The QR payload is returned as a Base64 URL-safe encoded string generated from the product snapshot JSON.
