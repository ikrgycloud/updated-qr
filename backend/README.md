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

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Start the server from the `backend` folder:

```bash
uvicorn app.main:app --reload
```

4. Open:

- Backend root: `<your-backend-url>/`
- Swagger UI: `<your-backend-url>/docs`
- ReDoc: `<your-backend-url>/redoc`

## Data Source

The backend does not seed or hardcode product data. Insert records into your database first, then call the APIs.

Empty product detail values are returned as empty strings in the product detail response.

## Frontend

The standalone React + Vite frontend lives in `../forntend`.

## Environment

Configure backend values in `.env`:

```bash
DATABASE_URL=
CORS_ORIGINS=
```

## Example Request

Generate a QR payload for a product id that already exists in your database:

```bash
curl -X POST "<your-backend-url>/api/qr/generate" \
  -H "Content-Type: application/json" \
  -d "{\"product_id\": 1, \"request_source\": \"frontend-scan\"}"
```

The QR payload is returned as a Base64 URL-safe encoded string generated from the product snapshot JSON.
