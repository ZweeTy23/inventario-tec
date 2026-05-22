# Inventario API

Enterprise inventory management API built with **Express 5**, **Prisma 7**, and **PostgreSQL** (multi-schema), written in **TypeScript**. Authentication via JWT, validation with Zod, structured logging with Pino, and seed data generated with `@faker-js/faker`.

## Stack

- Node.js + Express 5
- Prisma 7 + `@prisma/adapter-pg` (Rust-free client, driver adapter)
- PostgreSQL (multi-schema: `auth`, `catalog`, `warehouse`, `operations`, `system_alerts`)
- TypeScript (ESM, `NodeNext`)
- `zod` for validation, `bcrypt` + `jsonwebtoken` for auth, `pino` + `pino-http` for logging, `helmet` + `cors` for hardening
- `tsx` for dev & seed execution, `@faker-js/faker` for factories

## Prerequisites

- Node.js 20+
- Docker Desktop (recommended) **or** a PostgreSQL 14+ instance you own

## Quick start (Docker, recommended for teams)

This is the path every teammate should follow — it gives everyone the exact same PostgreSQL setup with known credentials, no installer prompts, and no port conflicts with any local Postgres they might have.

```powershell
# 1. Clone & enter
git clone <repo-url>
cd inventario-tec/server

# 2. Install npm dependencies
npm install

# 3. Copy the env file (defaults already point to the Dockerised DB on port 5433)
cp .env.example .env

# 4. Start the Dockerised Postgres (port 5433, user/pass = inventario/inventario_dev)
docker compose up -d postgres

# 5. Generate the Prisma client + apply migrations + seed
npm run prisma:generate
npm run db:setup

# 6. Run the dev server
npm run dev
```

The API listens on `http://localhost:3000`. Login at `POST /api/auth/login` with `admin@inventory.com` / `Admin123*`.

### Optional: pgAdmin web UI

The compose file also defines a `pgadmin` service behind the `tools` profile. Start it with:

```powershell
docker compose --profile tools up -d
```

Then open <http://localhost:8081>, log in with `admin@inventory.com` / `admin`, and add a new server pointing to:

- Host: `postgres` (the docker service name)
- Port: `5432` (internal port, not the published 5433)
- User / Password / DB: `inventario` / `inventario_dev` / `inventario`

### Useful Docker commands

| Command | What it does |
| --- | --- |
| `docker compose up -d postgres` | Start the Postgres container in the background |
| `docker compose ps` | See what's running |
| `docker compose logs -f postgres` | Tail Postgres logs |
| `docker compose stop` | Stop containers (data is kept in the named volume) |
| `docker compose down` | Stop and remove containers (data is kept) |
| `docker compose down -v` | Stop and **wipe** the database volume — full reset |
| `docker exec -it inventario-postgres psql -U inventario -d inventario` | Open a psql shell inside the container |

### Sharing the setup with the team

Everything they need is already in the repo:

- `server/docker-compose.yml` — Postgres + optional pgAdmin
- `server/.env.example` — points to the Dockerised DB by default; they just `cp .env.example .env`
- `server/prisma/schema.prisma`, `prisma/migrations/`, `prisma/seed.ts` — schema, migrations, seed
- `server/README.md` — this file

So the onboarding for a new teammate is exactly the 6 steps above. No DB credentials need to be shared, no `.env` needs to be sent on Slack — the defaults work out of the box.

## Quick start (your own Postgres)

If you'd rather use a Postgres you already have running, edit `.env` and change `DATABASE_URL` to your connection string. The user you connect with must have `CREATEDB` (so Prisma Migrate can create a shadow DB) and `CREATE SCHEMA` privileges on the target database.

```powershell
npm install
cp .env.example .env
# ...edit DATABASE_URL...
npm run prisma:generate
npm run db:setup
npm run dev
```

Default admin credentials seeded by `prisma/seeders/user.seeder.ts`:

- Email: `admin@inventory.com`
- Password: `Admin123*`

> Change the password immediately in any non-dev environment.

## Available scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Hot-reload dev server via `tsx watch src/server.ts` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server (`dist/server.js`) |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:migrate` | Apply / create migrations interactively |
| `npm run prisma:reset` | DROP everything and re-run migrations + seed |
| `npm run prisma:studio` | Open Prisma Studio against the database |
| `npm run prisma:seed` | Run the seeders (`prisma/seed.ts`) |
| `npm run db:setup` | Migrate + seed in one shot (first-time setup) |

## Project layout

```
server/
├── prisma/
│   ├── schema.prisma           # multi-schema models + 4 native enums
│   ├── migrations/
│   │   ├── 20260522113000_init/migration.sql           # tables, indexes, FKs
│   │   └── 20260522113001_check_constraints/migration.sql  # CHECK constraints
│   ├── factories/              # Reusable Faker-backed factories
│   ├── seeders/                # 10 seeders (roles → permissions → … → movements)
│   └── seed.ts                 # Orchestrator
├── src/
│   ├── server.ts               # http bootstrap + graceful shutdown
│   ├── app.ts                  # Express app: helmet, cors, pino-http, routes, error handler
│   ├── config/                 # env (validated by Zod), constants, roles, permissions
│   ├── lib/                    # prisma singleton, soft-delete extension, audit helper, jwt, hash, logger
│   ├── middlewares/            # auth, permission, validate, error
│   ├── shared/                 # AppError hierarchy, pagination utils, Express type augmentation
│   └── modules/                # One folder per domain (clean architecture)
│       └── <module>/
│           ├── <module>.routes.ts
│           ├── <module>.controller.ts
│           ├── <module>.service.ts
│           ├── <module>.repository.ts
│           └── <module>.schemas.ts
├── tsconfig.json
├── prisma.config.ts            # Prisma 7 config (datasource + seed)
└── .env.example
```

## Data model overview

| Schema | Tables |
| --- | --- |
| `auth` | `roles`, `permissions`, `role_permissions`, `users` |
| `catalog` | `categories` (self-ref), `suppliers`, `products` |
| `warehouse` | `locations` (self-ref, 5-level hierarchy), `stock_levels` |
| `operations` | `movements`, `audit_logs` |
| `system_alerts` | `notifications` |

Cross-cutting:

- UUID primary keys everywhere (`@db.Uuid`)
- `created_at`, `updated_at` on every table; `deleted_at` on `users`, `products`, `locations`
- JSONB for `suppliers.contact_info`, `products.attributes`, `audit_logs.old_data` / `new_data`
- Native PostgreSQL enums: `LocationType`, `MovementType`, `MovementStatus`, `NotificationType`
- Unique compound key on `stock_levels(product_id, location_id, batch_number)`
- CHECK constraints: `movements.quantity > 0`, `products.base_price >= 0`, `stock_levels.quantity >= 0`, etc.
- Indexes on `sku`, `email`, `created_at`, `movement_type`, `status`, `expiration_date`, `batch_number`

## Soft deletes

The Prisma client is extended with a `soft-delete` extension (see `src/lib/prisma.soft-delete.ts`) that:

- Converts `delete` / `deleteMany` on `User`, `Product`, `Location` into `update { deletedAt: now() }`.
- Filters `findMany` / `findFirst` / `findFirstOrThrow` / `count` / `aggregate` by `deletedAt: null` automatically.
- Exposes `prisma.<model>.forceDelete({ id })` when you really need to hard-delete.

## Roles and permissions

| Role | Permissions |
| --- | --- |
| `SUPER_ADMIN` | all |
| `MANAGER` | all except `users.manage` |
| `WAREHOUSE_OPERATOR` | `inventory.view`, `movements.create`, `products.view` |
| `AUDITOR` | `inventory.view`, `reports.view`, `alerts.view` |

JWTs embed the user's permissions, so the permission middleware can authorise without an extra database hit.

## API endpoints

All endpoints are prefixed with `/api`. List endpoints accept `?page=&perPage=&sortBy=&sortDir=` plus per-module filters and return `{ data, meta }`.

| Method | Path | Permission |
| --- | --- | --- |
| GET | `/health` | public |
| POST | `/auth/login` | public |
| GET | `/auth/me` | authenticated |
| GET / POST / PATCH / DELETE | `/users[/:id]` | `users.manage` |
| GET | `/roles` | authenticated |
| GET | `/permissions` | authenticated |
| GET / POST / PATCH / DELETE | `/categories[/:id]`, `/categories/tree` | `products.*` |
| GET / POST / PATCH / DELETE | `/suppliers[/:id]` | `products.*` |
| GET / POST / PATCH / DELETE | `/products[/:id]` | `products.*` |
| GET / POST / PATCH / DELETE | `/locations[/:id]`, `/locations/tree` | `inventory.*` |
| GET / PATCH | `/stock-levels[/:id]` | `inventory.view` / `inventory.update` |
| GET / POST | `/movements[/:id]` | `movements.view` / `movements.create` |
| POST | `/movements/:id/approve` | `movements.approve` |
| POST | `/movements/:id/reject` | `movements.approve` |
| GET | `/audit-logs` | `reports.view` |
| GET / POST | `/notifications`, `/notifications/:id/read`, `/notifications/read-all` | `alerts.view` |

### Example: login + create a movement

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@inventory.com","password":"Admin123*"}'

# Use the returned token
TOKEN="eyJhbGciOi..."

# Create a PURCHASE_ENTRY (destination required, no source)
curl -X POST http://localhost:3000/api/movements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "productId": "<product-uuid>",
        "destinationLocationId": "<level-uuid>",
        "quantity": 10,
        "movementType": "PURCHASE_ENTRY",
        "unitCost": 49.90
      }'

# Approve it (atomic stock update inside a Prisma transaction)
curl -X POST http://localhost:3000/api/movements/<movement-id>/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"batchNumber":"BATCH-202605-AB12","expirationDate":"2027-01-01"}'
```

## Movement rules (enforced by Zod + service layer)

| Type | Source | Destination | Stock effect on approve |
| --- | --- | --- | --- |
| `PURCHASE_ENTRY` | – | required | increment destination |
| `RETURN_ENTRY` | – | required | increment destination |
| `SALE_EXIT` | required | – | decrement source |
| `LOSS_EXIT` | required | – | decrement source |
| `EXPIRED_EXIT` | required | – | decrement source |
| `TRANSFER` | required | required (≠ source) | decrement source + increment destination |

Approvals run inside `prisma.$transaction` so stock changes are atomic; failures are rolled back. All approve/reject actions are written to `operations.audit_logs`.

## Seeders

The seed flow (`prisma/seed.ts`) is idempotent. Each step skips itself when the destination is already populated.

1. Roles
2. Permissions
3. Role ↔ Permission assignments
4. SUPER_ADMIN user (`admin@inventory.com`)
5. 4 root categories (Electronics, Tools, Spare Parts, Consumables)
6. 10 fake suppliers (JSONB `contactInfo`, `reliabilityScore`)
7. 100 fake products (unique SKU, JSONB attributes, random base price)
8. 1 warehouse with full hierarchy: 3 zones → 15 aisles → 150 shelves → 750 levels = **919 locations**
9. Random stock (1-4 batches per product on random LEVEL locations)
10. ~200 fake movements (mix of entry/exit/transfer with `APPROVED`/`PENDING`/`REJECTED` statuses)

## Troubleshooting

- **`Cannot resolve environment variable: DATABASE_URL`** when running Prisma CLI — make sure your `.env` file is in `server/` (not the repo root) and that `DATABASE_URL` is set.
- **`PrismaClientInitializationError: Authentication failed`** — your DB credentials don't match `DATABASE_URL`.
- **`PrismaClient is unable to run in this browser environment`** — never import from `src/lib/prisma.ts` in the frontend (`client/`); only use it server-side.
- **`P3014: Prisma Migrate could not create the shadow database`** — your Postgres user lacks the `CREATEDB` privilege. Either grant it or set `shadowDatabaseUrl` in `prisma.config.ts`.

## License

ISC
