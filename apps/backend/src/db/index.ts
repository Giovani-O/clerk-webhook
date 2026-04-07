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
