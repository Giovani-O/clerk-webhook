# Backend Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the `apps/backend` Fastify + SQLite backend with all infrastructure wired up — package setup, database layer, route stubs for all three endpoints — leaving only the `POST /webhooks/clerk` handler body as a TODO for the developer to implement.

**Architecture:** Fastify app with `@fastify/cors`, `@libsql/client` for async SQLite access (pure JS, no native build required), and three routes. The DB layer (`db/index.ts` + `db/events.ts`) is fully implemented. The `GET /api/events` and `DELETE /api/events` routes are fully implemented. `POST /webhooks/clerk` has the raw body parser set up but the handler body is left as a TODO. TypeScript uses a composite `tsc -b` build matching the frontend pattern, with `tsx` for dev mode.

**Tech Stack:** Fastify, `@fastify/cors`, `@libsql/client` (pure-JS SQLite, no native build), `@clerk/backend`, `@clerk-webhook/types` (workspace), `zod`, TypeScript, `tsx`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `apps/backend/package.json` | Create | Package metadata, dependencies, scripts |
| `apps/backend/tsconfig.json` | Create | Composite root — references tsconfig.app.json |
| `apps/backend/tsconfig.app.json` | Create | Compiler options for src/ |
| `apps/backend/.env.example` | Create | Documents required env vars |
| `apps/backend/.gitignore` | Create | Ignores `data/`, `dist/`, `.env` |
| `apps/backend/src/index.ts` | Create | Fastify instance, plugin registration, server start |
| `apps/backend/src/db/index.ts` | Create | `@libsql/client` connection, CREATE TABLE IF NOT EXISTS |
| `apps/backend/src/db/events.ts` | Create | `insertEvent()`, `findAll()`, `deleteAll()` (all async) |
| `apps/backend/src/routes/events.ts` | Create | `GET /api/events`, `DELETE /api/events` |
| `apps/backend/src/routes/webhooks.ts` | Create | `POST /webhooks/clerk` stub with raw body parser |

---

### Task 1: `apps/backend/package.json`

**Files:**
- Create: `apps/backend/package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "backend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -b",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@clerk-webhook/types": "workspace:*",
    "@clerk/backend": "^1",
    "@fastify/cors": "^10",
    "@libsql/client": "^0.14",
    "fastify": "^5",
    "zod": "^3"
  },
  "devDependencies": {
    "@types/node": "^22",
    "tsx": "^4",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Install dependencies from monorepo root**

Run: `pnpm install`

Expected: `apps/backend` dependencies resolved from workspace + registry. No errors.

- [ ] **Step 3: Verify pnpm resolves workspace dep**

Run: `pnpm --filter backend ls @clerk-webhook/types`

Expected: output lists `@clerk-webhook/types` linked from `packages/types`.

---

### Task 2: TypeScript config

**Files:**
- Create: `apps/backend/tsconfig.json`
- Create: `apps/backend/tsconfig.app.json`

- [ ] **Step 1: Create tsconfig.json (composite root)**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" }
  ]
}
```

- [ ] **Step 2: Create tsconfig.app.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Verify TypeScript config parses**

Run: `pnpm --filter backend exec tsc -b --dry`

Expected: exits 0 with no errors (no source files yet, that's fine).

---

### Task 3: `.env.example` and `.gitignore`

**Files:**
- Create: `apps/backend/.env.example`
- Create: `apps/backend/.gitignore`

- [ ] **Step 1: Create .env.example**

```bash
# apps/backend/.env.example
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...   # Clerk Dashboard → Webhooks → your endpoint → Signing Secret
PORT=3001
```

- [ ] **Step 2: Create .gitignore**

```
.env
data/
dist/
```

---

### Task 4: Database connection — `src/db/index.ts`

**Files:**
- Create: `apps/backend/src/db/index.ts`

- [ ] **Step 1: Create database directory and db/index.ts**

First create the `src/db/` directory (it will exist once the file is written). Write `src/db/index.ts`:

```ts
import { createClient } from '@libsql/client'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdirSync } from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Resolve data/ directory relative to apps/backend/ (two levels up from src/db/)
const dataDir = join(__dirname, '..', '..', 'data')
mkdirSync(dataDir, { recursive: true })

const dbPath = join(dataDir, 'webhook_events.sqlite')

export const db = createClient({ url: `file:${dbPath}` })

await db.execute(`
  CREATE TABLE IF NOT EXISTS webhook_events (
    id          TEXT    PRIMARY KEY,
    svix_id     TEXT    NOT NULL UNIQUE,
    event_type  TEXT    NOT NULL,
    payload     TEXT    NOT NULL,
    received_at INTEGER NOT NULL
  )
`)
```

**Why `__dirname` via `fileURLToPath`:** The backend uses `"type": "module"`, so `__dirname` is not available natively. We reconstruct it from `import.meta.url`.

**Why two levels up:** `src/db/index.ts` compiles to `dist/db/index.js`. At runtime `__dirname` is `dist/db/`. Two levels up (`../..`) from there is `apps/backend/`, which is where `data/` should live. This also works during `tsx` dev because `tsx` runs from the source tree and resolves the same relative path.

**Why `@libsql/client` instead of `better-sqlite3`:** `better-sqlite3` is a native Node addon that requires `g++` to compile from source. `@libsql/client` is pure JavaScript and works without a C++ compiler. The tradeoff is that all DB calls are async (`await db.execute(...)`), which integrates naturally with Fastify's async route handlers.

---

### Task 5: Database queries — `src/db/events.ts`

**Files:**
- Create: `apps/backend/src/db/events.ts`

- [ ] **Step 1: Write db/events.ts**

```ts
import { db } from './index.js'

export interface RawEventRow {
  id: string
  svix_id: string
  event_type: string
  payload: string       // JSON string as stored in SQLite
  received_at: number
}

export interface InsertEventParams {
  id: string
  svix_id: string
  event_type: string
  payload: string       // JSON string — caller serialises before passing
  received_at: number
}

export async function insertEvent(params: InsertEventParams): Promise<void> {
  await db.execute({
    sql: `INSERT OR IGNORE INTO webhook_events (id, svix_id, event_type, payload, received_at)
          VALUES (:id, :svix_id, :event_type, :payload, :received_at)`,
    args: {
      id: params.id,
      svix_id: params.svix_id,
      event_type: params.event_type,
      payload: params.payload,
      received_at: params.received_at,
    },
  })
}

export async function findAll(): Promise<RawEventRow[]> {
  const result = await db.execute(
    'SELECT id, svix_id, event_type, payload, received_at FROM webhook_events ORDER BY received_at DESC LIMIT 50',
  )
  return result.rows.map((row) => ({
    id: row.id as string,
    svix_id: row.svix_id as string,
    event_type: row.event_type as string,
    payload: row.payload as string,
    received_at: row.received_at as number,
  }))
}

export async function deleteAll(): Promise<void> {
  await db.execute('DELETE FROM webhook_events')
}
```

**Note on `INSERT OR IGNORE`:** If a row with the same `svix_id` already exists (Svix retry), the insert is silently skipped. The route still returns `200 OK`. This is the idempotency mechanism described in the SDD.

---

### Task 6: Events routes — `src/routes/events.ts`

**Files:**
- Create: `apps/backend/src/routes/events.ts`

- [ ] **Step 1: Write routes/events.ts**

```ts
import type { FastifyInstance } from 'fastify'
import { WebhookEventSchema } from '@clerk-webhook/types'
import { findAll, deleteAll } from '../db/events.js'

export async function eventsRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /api/events — return last 50 events ordered by received_at DESC
  fastify.get('/api/events', async (_request, reply) => {
    const rows = await findAll()

    const events = rows.map((row) => {
      const parsed = WebhookEventSchema.parse({
        id: row.id,
        svix_id: row.svix_id,
        event_type: row.event_type,
        payload: JSON.parse(row.payload),
        received_at: row.received_at,
      })
      return parsed
    })

    return reply.send(events)
  })

  // DELETE /api/events — truncate all stored events (demo reset)
  fastify.delete('/api/events', async (_request, reply) => {
    await deleteAll()
    return reply.code(204).send()
  })
}
```

---

### Task 7: Webhook route stub — `src/routes/webhooks.ts`

**Files:**
- Create: `apps/backend/src/routes/webhooks.ts`

- [ ] **Step 1: Write routes/webhooks.ts**

```ts
import type { FastifyInstance } from 'fastify'

export async function webhooksRoutes(fastify: FastifyInstance): Promise<void> {
  // Register a raw body parser for this route so the body arrives as a string.
  // IMPORTANT: Do NOT use the default JSON parser here — Svix signature
  // verification requires the byte-exact raw request body. Parsing it first
  // corrupts the signature check.
  fastify.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (_req, body, done) => {
      done(null, body)
    },
  )

  fastify.post('/webhooks/clerk', async (request, reply) => {
    const rawBody = request.body as string

    // TODO: Verify the Svix signature using verifyWebhook() from @clerk/backend
    //
    // import { verifyWebhook } from '@clerk/backend/webhooks'
    //
    // const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET
    // if (!secret) throw new Error('CLERK_WEBHOOK_SIGNING_SECRET is not set')
    //
    // let event
    // try {
    //   event = await verifyWebhook(rawBody, {
    //     'svix-id': request.headers['svix-id'] as string,
    //     'svix-timestamp': request.headers['svix-timestamp'] as string,
    //     'svix-signature': request.headers['svix-signature'] as string,
    //   }, secret)
    // } catch {
    //   return reply.code(400).send({ error: 'Invalid signature' })
    // }

    // TODO: Extract event_type and svix_id, insert into DB
    //
    // import { insertEvent } from '../db/events.js'
    // import { randomUUID } from 'node:crypto'
    //
    // await insertEvent({
    //   id: randomUUID(),
    //   svix_id: request.headers['svix-id'] as string,
    //   event_type: event.type,
    //   payload: JSON.stringify(event.data),
    //   received_at: Date.now(),
    // })

    return reply.code(200).send({ received: true })
  })
}
```

---

### Task 8: Fastify app entry point — `src/index.ts`

**Files:**
- Create: `apps/backend/src/index.ts`

- [ ] **Step 1: Write src/index.ts**

```ts
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { eventsRoutes } from './routes/events.js'
import { webhooksRoutes } from './routes/webhooks.js'

const fastify = Fastify({
  logger: true,
})

await fastify.register(cors, {
  origin: 'http://localhost:5173',
  methods: ['GET', 'DELETE', 'POST'],
})

await fastify.register(eventsRoutes)
await fastify.register(webhooksRoutes)

const port = Number(process.env.PORT ?? 3001)

try {
  await fastify.listen({ port, host: '0.0.0.0' })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
```

---

### Task 9: Smoke test — verify the server starts and routes respond

**Files:** (no new files)

- [ ] **Step 1: Start the dev server**

Run (in a separate terminal): `pnpm --filter backend dev`

Expected output includes:
```
{"level":30,"msg":"Server listening at http://0.0.0.0:3001"}
```

- [ ] **Step 2: Verify GET /api/events returns empty array**

Run: `curl -s http://localhost:3001/api/events`

Expected: `[]`

- [ ] **Step 3: Verify DELETE /api/events returns 204**

Run: `curl -s -o /dev/null -w "%{http_code}" -X DELETE http://localhost:3001/api/events`

Expected: `204`

- [ ] **Step 4: Verify POST /webhooks/clerk returns 200**

Run:
```bash
curl -s -X POST http://localhost:3001/webhooks/clerk \
  -H "Content-Type: application/json" \
  -d '{}' \
  -H "svix-id: test" \
  -H "svix-timestamp: 1234567890" \
  -H "svix-signature: test"
```

Expected: `{"received":true}` — the stub responds 200 before any verification logic is added.

- [ ] **Step 5: Verify TypeScript build passes**

Stop the dev server. Run: `pnpm --filter backend build`

Expected: exits 0, `dist/` directory created with compiled JS files.

---

### Task 10: Update root `.gitignore`

**Files:**
- Modify: `.gitignore` (root)

- [ ] **Step 1: Ensure data/ and dist/ patterns are covered**

Open root `.gitignore`. If it doesn't already contain `dist` and `*.sqlite`, add:

```
apps/backend/data/
apps/backend/dist/
```

If the root `.gitignore` already has `dist/` globally covered, skip the `dist` line. The `data/` line is the important one.
