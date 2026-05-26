# Product Intelligence Frontend

Standalone React + Vite frontend for the FastAPI product backend.

## Run

```bash
npm install
npm run dev
```

## Environment

Create a `.env` file and configure:

```bash
VITE_API_PROXY_TARGET=
VITE_DEV_PORT=5173
VITE_COMPANY_NAME=
```

`VITE_API_PROXY_TARGET` is only needed for local Vite development. The frontend uses relative `/api` requests, so production can work from a single deployed app URL without a separate API base URL variable.
