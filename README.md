# Simple Notes App

A customer purchase pattern analysis app with a Next.js frontend, Spring Boot backend, and PostgreSQL database.

## Start

```sh
./start.sh
```

This starts PostgreSQL and the backend with Docker.

Run the frontend locally:

```sh
cd frontend
npm run dev
```

Open http://localhost:3000.

## Stop

```sh
./stop.sh
```

## API

- `GET /api/notes`
- `POST /api/notes`
- `PUT /api/notes/{id}`
- `DELETE /api/notes/{id}`
