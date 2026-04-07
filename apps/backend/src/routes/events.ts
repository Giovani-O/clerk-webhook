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
