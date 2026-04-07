# Frontend (Mocked Data) — Design Spec

**Date:** 2026-04-07
**Status:** Approved
**Scope:** `apps/frontend` — full frontend scaffold with static mock data. No backend required.

---

## 1. Goal

Build the complete `apps/frontend` application as specified in the SDD, with one difference: `useEvents()` returns a static in-memory array instead of calling the real API. When the backend is ready, a single line swap replaces the mock with a real `fetch` call. Nothing else changes.

---

## 2. Stack

| Concern | Library |
|---|---|
| Framework | React 19 + Vite |
| Routing | TanStack Router (file-based) |
| Data fetching | TanStack Query v5 |
| Auth | `@clerk/react` |
| Styling | Tailwind CSS v4 |
| Syntax highlighting | Shiki |
| Shared types | `@clerk-webhook/types` (workspace package) |

**Tailwind v4:** configured via `@import "tailwindcss"` in `src/index.css`. No `tailwind.config.js` needed.

**TanStack Router:** file-based routing. Router devtools included in dev mode only.

---

## 3. File Structure

```
apps/frontend/
├── package.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx                    ← createRouter, RouterProvider
│   ├── index.css                   ← @import "tailwindcss"
│   ├── routes/
│   │   ├── __root.tsx              ← ClerkProvider, QueryClientProvider, Outlet
│   │   └── index.tsx               ← single page: AuthPanel + EventInspector
│   ├── components/
│   │   ├── AuthPanel.tsx           ← SignIn or UserProfile based on useUser()
│   │   ├── EventInspector.tsx      ← manages selectedId state, renders EventList + PayloadInspector
│   │   ├── EventList.tsx           ← maps events → EventListItem
│   │   ├── EventListItem.tsx       ← badge + email + relative timestamp
│   │   └── PayloadInspector.tsx    ← Shiki-highlighted JSON or empty state
│   ├── api/
│   │   └── events.ts               ← MOCK_EVENTS array + useEvents() hook
│   └── lib/
│       └── shiki.ts                ← module-level highlighter singleton, exports highlight()
```

**Note:** `MOCK_EVENTS` lives in `src/api/events.ts` alongside `useEvents()`. No separate `src/mocks/` directory.

---

## 4. Mock Data

Six events covering all three event types, ordered by `received_at` descending (most recent first):

```ts
// src/api/events.ts
const MOCK_EVENTS: WebhookEvent[] = [
  { id: '...uuid...', svix_id: 'msg_1', event_type: 'user.created',  received_at: now - 10_000,   payload: { ... } },
  { id: '...uuid...', svix_id: 'msg_2', event_type: 'user.updated',  received_at: now - 30_000,   payload: { ... } },
  { id: '...uuid...', svix_id: 'msg_3', event_type: 'user.deleted',  received_at: now - 60_000,   payload: { ... } },
  { id: '...uuid...', svix_id: 'msg_4', event_type: 'user.created',  received_at: now - 120_000,  payload: { ... } },
  { id: '...uuid...', svix_id: 'msg_5', event_type: 'user.updated',  received_at: now - 300_000,  payload: { ... } },
  { id: '...uuid...', svix_id: 'msg_6', event_type: 'user.deleted',  received_at: now - 600_000,  payload: { ... } },
]
```

Each payload is a realistic Clerk `user.*` shape:

```ts
{
  object: 'event',
  type: 'user.created',       // matches event_type
  data: {
    id: 'user_abc123',
    first_name: 'Alice',
    last_name: 'Smith',
    email_addresses: [
      { email_address: 'alice@example.com', id: 'idn_abc123' }
    ],
    created_at: 1712345678000,
    updated_at: 1712345678000,
  }
}
```

`useEvents()` returns `{ data: MOCK_EVENTS, isLoading: false, isError: false }` directly. `refetchInterval` is set to `false` (commented with a note pointing to where polling gets re-enabled).

---

## 5. Layout

Full-height two-column split. No responsive breakpoints required for this demo.

```
┌─────────────────────┬──────────────────────────────────────┐
│                     │                                      │
│    AuthPanel        │         EventInspector               │
│  (placeholder div   │  ┌─────────────┬──────────────────┐  │
│   in mock mode)     │  │  EventList  │ PayloadInspector  │  │
│                     │  │             │                   │  │
│                     │  └─────────────┴──────────────────┘  │
└─────────────────────┴──────────────────────────────────────┘
```

**`AuthPanel`:** In mock mode renders a placeholder `<div>` with a border and "Auth panel" label at the same dimensions as the real Clerk component. The real `<SignIn />` / `<UserProfile />` logic is written but gated behind a `VITE_CLERK_PUBLISHABLE_KEY` check — if the key is absent or empty the placeholder renders instead. This lets the layout be tested without a Clerk account.

---

## 6. Component Responsibilities

### `EventInspector`
- Calls `useEvents()` once
- Holds `selectedId: string | null` in `useState`
- On first render, auto-selects `data[0].id` via `useEffect` (when `data` is present and `selectedId` is `null`)
- Passes `events`, `selectedId`, and `onSelect` down to `EventList`
- Passes the selected event's `payload` (or `null`) down to `PayloadInspector`

### `EventList`
- Receives `events: WebhookEvent[]`, `selectedId: string | null`, `onSelect: (id: string) => void`
- Renders a scrollable list of `EventListItem` rows
- Applies an active highlight style to the row matching `selectedId`

### `EventListItem`
- Receives a single `WebhookEvent` and `isSelected: boolean`
- Renders three elements:
  - **Type badge:** coloured pill — blue (`user.created`), green (`user.updated`), red (`user.deleted`)
  - **Email:** extracted from `event.payload.data.email_addresses[0].email_address`
  - **Relative timestamp:** computed inline with a small pure helper function `formatRelativeTime(ms: number): string` (e.g. "10 seconds ago", "2 minutes ago") — no date library

### `PayloadInspector`
- Receives `payload: Record<string, unknown> | null`
- If `null`: renders centred grey text "Select an event to inspect"
- If present: calls `highlight(JSON.stringify(payload, null, 2))` in a `useEffect`, stores the resulting HTML string in local state, renders with `dangerouslySetInnerHTML`
- While the async highlight is pending: renders the plain JSON string (no flash of unstyled content after first highlight)

### `AuthPanel`
- Reads `VITE_CLERK_PUBLISHABLE_KEY` from `import.meta.env`
- If absent/empty: renders placeholder div
- If present: uses `useUser()` — loading spinner → `<SignIn />` → `<UserProfile />`

---

## 7. Shiki Singleton (`lib/shiki.ts`)

```ts
import { createHighlighter } from 'shiki'

const highlighterPromise = createHighlighter({
  themes: ['github-dark'],
  langs: ['json'],
})

export async function highlight(code: string): Promise<string> {
  const highlighter = await highlighterPromise
  return highlighter.codeToHtml(code, { lang: 'json', theme: 'github-dark' })
}
```

Called once at module load. No React context or prop-drilling needed. `PayloadInspector` imports `highlight` directly.

---

## 8. Data Flow

```
MOCK_EVENTS (static array in api/events.ts)
    │
    └── useEvents() → { data: WebhookEvent[] }
            │
            └── EventInspector
                    │  selectedId: string | null  (useState)
                    │
                    ├── EventList
                    │       │
                    │       └── EventListItem × N
                    │             onClick → setSelectedId(event.id)
                    │
                    └── PayloadInspector
                              │
                              └── highlight(JSON.stringify(payload, null, 2))
                                        │
                                        └── dangerouslySetInnerHTML
```

---

## 9. Swap Point (mock → real API)

When the backend is ready, the only change needed in this file:

```ts
// src/api/events.ts — BEFORE (mock)
export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => Promise.resolve(MOCK_EVENTS),
    refetchInterval: false,  // re-enable: 3000
  })
}

// AFTER (real)
export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,    // calls GET /api/events
    refetchInterval: 3000,
  })
}
```

No other files change.

---

## 10. Out of Scope (this spec)

- Backend (`apps/backend`)
- Shared types package (`packages/types`) — must be scaffolded before the frontend build step (the implementation plan should include it as a prerequisite step)
- ngrok setup
- Clerk Dashboard configuration
- Production build or deployment
