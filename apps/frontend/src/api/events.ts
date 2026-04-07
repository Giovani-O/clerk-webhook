import { useQuery } from '@tanstack/react-query'
import type { WebhookEvent } from '@clerk-webhook/types'

const now = Date.now()

// Six mock events covering all three event types, ordered by received_at DESC
const MOCK_EVENTS: WebhookEvent[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    svix_id: 'msg_1',
    event_type: 'user.created',
    received_at: now - 10_000,
    payload: {
      object: 'event',
      type: 'user.created',
      data: {
        id: 'user_alpha01',
        first_name: 'Alice',
        last_name: 'Smith',
        email_addresses: [{ id: 'idn_alpha01', email_address: 'alice@example.com' }],
        created_at: now - 10_000,
        updated_at: now - 10_000,
      },
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    svix_id: 'msg_2',
    event_type: 'user.updated',
    received_at: now - 30_000,
    payload: {
      object: 'event',
      type: 'user.updated',
      data: {
        id: 'user_beta02',
        first_name: 'Bob',
        last_name: 'Jones',
        email_addresses: [{ id: 'idn_beta02', email_address: 'bob@example.com' }],
        created_at: now - 300_000,
        updated_at: now - 30_000,
      },
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    svix_id: 'msg_3',
    event_type: 'user.deleted',
    received_at: now - 60_000,
    payload: {
      object: 'event',
      type: 'user.deleted',
      data: {
        id: 'user_gamma03',
        first_name: 'Carol',
        last_name: 'Williams',
        email_addresses: [{ id: 'idn_gamma03', email_address: 'carol@example.com' }],
        created_at: now - 600_000,
        updated_at: now - 60_000,
      },
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    svix_id: 'msg_4',
    event_type: 'user.created',
    received_at: now - 120_000,
    payload: {
      object: 'event',
      type: 'user.created',
      data: {
        id: 'user_delta04',
        first_name: 'Dan',
        last_name: 'Brown',
        email_addresses: [{ id: 'idn_delta04', email_address: 'dan@example.com' }],
        created_at: now - 120_000,
        updated_at: now - 120_000,
      },
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    svix_id: 'msg_5',
    event_type: 'user.updated',
    received_at: now - 300_000,
    payload: {
      object: 'event',
      type: 'user.updated',
      data: {
        id: 'user_epsilon05',
        first_name: 'Eve',
        last_name: 'Davis',
        email_addresses: [{ id: 'idn_epsilon05', email_address: 'eve@example.com' }],
        created_at: now - 3_600_000,
        updated_at: now - 300_000,
      },
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    svix_id: 'msg_6',
    event_type: 'user.deleted',
    received_at: now - 600_000,
    payload: {
      object: 'event',
      type: 'user.deleted',
      data: {
        id: 'user_zeta06',
        first_name: 'Frank',
        last_name: 'Miller',
        email_addresses: [{ id: 'idn_zeta06', email_address: 'frank@example.com' }],
        created_at: now - 7_200_000,
        updated_at: now - 600_000,
      },
    },
  },
]

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    // MOCK: replace the line below with `queryFn: fetchEvents` when the backend is ready
    queryFn: () => Promise.resolve(MOCK_EVENTS),
    // MOCK: re-enable polling when backend is ready: refetchInterval: 3000
    refetchInterval: false,
  })
}
