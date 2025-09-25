# 🎢 Apark API

A small backend project built with **Node.js + Express + TypeScript + Prisma + PostgreSQL**.  
The API models a **theme park (nöjespark)** with parks, attractions, visits, and queue samples.  
It supports listing data, filtering, validation, and analytics queries.

---

## 📦 Tech Stack

-   **Express 5** – API framework
-   **TypeScript** – static typing
-   **Prisma ORM** – database client
-   **PostgreSQL** – relational database
-   **Zod** – input validation
-   **Pino** – logging
-   **Vitest + Supertest** – testing

---

## 🚀 Getting Started

### 1. Clone repo

```bash
git clone https://github.com/greenwinther/apark-api.git
cd apark-api
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment

Copy `.env.example` → `.env` and adjust `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://apark:YOURPASSWORD@localhost:5432/apark_api"
```

### 4. Database

Run initial migration and seed: (will ask for name, e.g."init")

```bash
pnpm db:migrate
pnpm db:seed
```

### 5. Run dev server

```bash
pnpm dev
```

Server starts on http://localhost:3000.

## 🌐 API Endpoints

### Health

-   `GET /healthz`

### Parks

-   `GET /api/parks` – list all parks

-   `GET /api/parks?city=Lidköping` – filter by city

-   `GET /api/parks/:id` – fetch park by ID

### Attractions

-   `GET /api/attractions/park/:parkId`

    -   Optional filters: `?type=rollercoaster&active=true`

### Analytics

-   `GET /api/analytics/parks/:parkId/summary`

    -   Totals, active/inactive attractions, visitors YTD, queue stats

-   `GET /api/analytics/top-queues?days=7&limit=5`

    -   Top attractions by avg queue time

## 🧪 Testing (optional)

Run tests (pretest automatically resets + seeds DB):

```bash
pnpm test
pnpm test --coverage
```

## 📂 Project Structure

```bash
src/
  app.ts            # Express app setup
  server.ts         # HTTP server + startup
  libs/
    prisma.ts       # Prisma client singleton
  routes/           # Feature routers
  schemas/          # Zod schemas
  middleware/       # Error + validation
  utils/
    httpError.ts    # HttpError helper

prisma/
  schema.prisma     # Database schema
  seed.ts           # Seed script

tests/
  health.spec.ts        # /healthz
  parks.spec.ts         # parks endpoints (lista/filter/id)
  attractions.spec.ts   # attractions per park + filter
  analytics.spec.ts     # analytics summary + top-queues

# Övrigt (rotmappen)
README.md
.env.example
tsconfig.json
vitest.config.ts
package.json
pnpm-lock.yaml
```
