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
