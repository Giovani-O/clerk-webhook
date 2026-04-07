import { z } from 'zod'

export const WebhookEventSchema = z.object({
  id: z.string().uuid(),
  svix_id: z.string(),
  event_type: z.enum(['user.created', 'user.updated', 'user.deleted']),
  payload: z.record(z.unknown()),
  received_at: z.number(),
})

export type WebhookEvent = z.infer<typeof WebhookEventSchema>
