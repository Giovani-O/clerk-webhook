import type { WebhookEvent } from '@clerk-webhook/types'
import { EventListItem } from './EventListItem'

interface Props {
  events: WebhookEvent[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function EventList({ events, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-col overflow-y-auto h-full">
      {events.map((event) => (
        <EventListItem
          key={event.id}
          event={event}
          isSelected={event.id === selectedId}
          onClick={() => onSelect(event.id)}
        />
      ))}
    </div>
  )
}
