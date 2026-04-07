import type { WebhookEvent } from '@clerk-webhook/types'
import { formatRelativeTime } from '../lib/time'

const BADGE_STYLES: Record<WebhookEvent['event_type'], string> = {
  'user.created': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  'user.updated': 'bg-green-500/20 text-green-300 border border-green-500/30',
  'user.deleted': 'bg-red-500/20 text-red-300 border border-red-500/30',
}

interface Props {
  event: WebhookEvent
  isSelected: boolean
  onClick: () => void
}

function getEmail(event: WebhookEvent): string {
  try {
    const data = event.payload.data as {
      email_addresses?: Array<{ email_address: string }>
    }
    return data.email_addresses?.[0]?.email_address ?? '(no email)'
  } catch {
    return '(no email)'
  }
}

export function EventListItem({ event, isSelected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full text-left px-4 py-3 flex flex-col gap-1 border-b border-gray-800 transition-colors',
        isSelected ? 'bg-gray-800' : 'hover:bg-gray-900',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={[
            'text-xs font-mono px-2 py-0.5 rounded-full',
            BADGE_STYLES[event.event_type],
          ].join(' ')}
        >
          {event.event_type}
        </span>
        <span className="text-xs text-gray-500 shrink-0">
          {formatRelativeTime(event.received_at)}
        </span>
      </div>
      <span className="text-sm text-gray-300 truncate">{getEmail(event)}</span>
    </button>
  )
}
