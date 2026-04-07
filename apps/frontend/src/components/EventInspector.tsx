import { useEffect, useState } from 'react'
import { useEvents } from '../api/events'
import { EventList } from './EventList'
import { PayloadInspector } from './PayloadInspector'
import type { WebhookEvent } from '@clerk-webhook/types'

export function EventInspector() {
  const { data: events = [], isLoading, isError } = useEvents()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Auto-select first event on initial data load
  useEffect(() => {
    if (events.length > 0 && selectedId === null) {
      setSelectedId(events[0].id)
    }
  }, [events, selectedId])

  const selectedEvent: WebhookEvent | undefined = events.find((e) => e.id === selectedId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-sm">Loading events…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-400 text-sm">Failed to load events.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Event Inspector
        </h2>
      </div>
      <div className="flex flex-1 min-h-0">
        <div className="w-72 shrink-0 border-r border-gray-800 overflow-y-auto">
          <EventList
            events={events}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
        <div className="flex-1 min-w-0 overflow-auto">
          <PayloadInspector payload={selectedEvent?.payload ?? null} />
        </div>
      </div>
    </div>
  )
}
