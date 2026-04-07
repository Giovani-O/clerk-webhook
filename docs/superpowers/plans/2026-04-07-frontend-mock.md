# Frontend (Mocked Data) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete `apps/frontend` React application with all components, routing, Tailwind styling, and Shiki syntax highlighting — using a static mock array in place of the real API.

**Architecture:** pnpm monorepo with a `packages/types` shared Zod schema package and an `apps/frontend` Vite+React app. `useEvents()` returns a hardcoded `MOCK_EVENTS` array; when the backend is ready, one line swaps it for a real `fetch`. All component structure, routing, and styling are final and not throwaway.

**Tech Stack:** React 19, Vite, TanStack Router (file-based), TanStack Query v5, Tailwind CSS v4, Shiki, `@clerk/react`, Zod, pnpm workspaces, TypeScript.

---

## File Map

| File | Responsibility |
|---|---|
| `package.json` (root) | pnpm workspaces config |
| `packages/types/package.json` | workspace package `@clerk-webhook/types` |
| `packages/types/src/index.ts` | `WebhookEventSchema` (Zod) + `WebhookEvent` type |
| `apps/frontend/package.json` | frontend dependencies |
| `apps/frontend/vite.config.ts` | Vite + TanStack Router plugin config |
| `apps/frontend/index.html` | HTML entry point |
| `apps/frontend/src/main.tsx` | `createRouter`, `RouterProvider` |
| `apps/frontend/src/index.css` | `@import "tailwindcss"` |
| `apps/frontend/src/routes/__root.tsx` | `ClerkProvider`, `QueryClientProvider`, `Outlet` |
| `apps/frontend/src/routes/index.tsx` | Single page — `AuthPanel` + `EventInspector` side by side |
| `apps/frontend/src/components/AuthPanel.tsx` | Placeholder div (mock) or `<SignIn />`/`<UserProfile />` (real) |
| `apps/frontend/src/components/EventInspector.tsx` | `selectedId` state, composes `EventList` + `PayloadInspector` |
| `apps/frontend/src/components/EventList.tsx` | Scrollable list of `EventListItem` rows |
| `apps/frontend/src/components/EventListItem.tsx` | Badge + email + relative timestamp per event row |
| `apps/frontend/src/components/PayloadInspector.tsx` | Shiki-highlighted JSON or empty state |
| `apps/frontend/src/api/events.ts` | `MOCK_EVENTS` array + `useEvents()` TanStack Query hook |
| `apps/frontend/src/lib/shiki.ts` | Module-level Shiki singleton, exports `highlight()` |
| `apps/frontend/src/lib/time.ts` | Pure `formatRelativeTime(ms: number): string` helper |

---

## Task 1: Monorepo root + `packages/types`

**Files:**
- Create: `package.json` (root)
- Create: `packages/types/package.json`
- Create: `packages/types/tsconfig.json`
- Create: `packages/types/src/index.ts`

- [ ] **Step 1: Create root `package.json`**

```json
{
  "name": "clerk-webhook",
  "private": true,
  "version": "0.0.0",
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

Save to `package.json` at the monorepo root.

- [ ] **Step 2: Create `packages/types/package.json`**

```json
{
  "name": "@clerk-webhook/types",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

- [ ] **Step 3: Create `packages/types/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Install Zod in the types package**

```bash
pnpm add zod --filter @clerk-webhook/types
```

- [ ] **Step 5: Write `packages/types/src/index.ts`**

```ts
import { z } from 'zod'

export const WebhookEventSchema = z.object({
  id: z.string().uuid(),
  svix_id: z.string(),
  event_type: z.enum(['user.created', 'user.updated', 'user.deleted']),
  payload: z.record(z.unknown()),
  received_at: z.number(),
})

export type WebhookEvent = z.infer<typeof WebhookEventSchema>
```

- [ ] **Step 6: Verify types package resolves**

```bash
pnpm --filter @clerk-webhook/types exec tsc --noEmit
```

Expected: no errors, no output.

- [ ] **Step 7: Commit**

```bash
git add package.json packages/
git commit -m "feat: add monorepo root and @clerk-webhook/types package"
```

---

## Task 2: `apps/frontend` scaffold

**Files:**
- Create: `apps/frontend/package.json`
- Create: `apps/frontend/tsconfig.json`
- Create: `apps/frontend/tsconfig.app.json`
- Create: `apps/frontend/vite.config.ts`
- Create: `apps/frontend/index.html`

- [ ] **Step 1: Create `apps/frontend/package.json`**

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@clerk-webhook/types": "workspace:*",
    "@clerk/react": "^6",
    "@tanstack/react-query": "^5",
    "@tanstack/react-router": "^1",
    "react": "^19",
    "react-dom": "^19",
    "shiki": "^1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4",
    "@tanstack/router-plugin": "^1",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^4",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vite": "^6"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
pnpm install
```

Expected: all packages resolved, `node_modules` populated in `apps/frontend` and `packages/types`.

- [ ] **Step 3: Create `apps/frontend/tsconfig.json`**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" }
  ]
}
```

- [ ] **Step 4: Create `apps/frontend/tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create `apps/frontend/vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: './src/routes' }),
    react(),
    tailwindcss(),
  ],
})

Note: `@vitejs/plugin-react` needs to be installed. Add it:

```bash
pnpm add -D @vitejs/plugin-react --filter frontend
```

- [ ] **Step 6: Create `apps/frontend/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Clerk Webhook Demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/
git commit -m "feat: scaffold apps/frontend with Vite, React, TanStack, Tailwind"
```

---

## Task 3: `src/index.css` + `src/main.tsx`

**Files:**
- Create: `apps/frontend/src/index.css`
- Create: `apps/frontend/src/main.tsx`

- [ ] **Step 1: Create `apps/frontend/src/index.css`**

```css
@import "tailwindcss";
```

- [ ] **Step 2: Create `apps/frontend/src/main.tsx`**

TanStack Router file-based routing generates a `routeTree.gen.ts` file on first `vite dev` run. `main.tsx` imports from it. Write it so the router is configured but the dev server must be run once to generate the route tree.

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import './index.css'

// Generated by TanStack Router plugin — created on first `vite dev` run
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!
createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/index.css apps/frontend/src/main.tsx
git commit -m "feat: add CSS entry point and main.tsx router bootstrap"
```

---

## Task 4: Route files — `__root.tsx` and `index.tsx` (shells)

**Files:**
- Create: `apps/frontend/src/routes/__root.tsx`
- Create: `apps/frontend/src/routes/index.tsx`

These are written as shells first (no real components yet) so the router generates the route tree and the dev server starts cleanly.

- [ ] **Step 1: Create `apps/frontend/src/routes/__root.tsx`**

```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider } from '@clerk/react'

const queryClient = new QueryClient()

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

function RootLayout() {
  const content = (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  )

  if (!PUBLISHABLE_KEY) {
    return content
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {content}
    </ClerkProvider>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
```

- [ ] **Step 2: Create `apps/frontend/src/routes/index.tsx` (shell)**

```tsx
import { createFileRoute } from '@tanstack/react-router'

function IndexPage() {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      <p className="m-auto text-gray-400">Loading…</p>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: IndexPage,
})
```

- [ ] **Step 3: Run the dev server once to generate the route tree**

```bash
pnpm --filter frontend dev
```

Expected: Vite starts on port 5173, `src/routeTree.gen.ts` is created automatically by the TanStack Router plugin, browser shows "Loading…" text on a dark background. Stop the server (Ctrl+C).

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/routes/ apps/frontend/src/routeTree.gen.ts
git commit -m "feat: add root layout and index route shells, generate route tree"
```

---

## Task 5: `lib/time.ts` — relative timestamp helper

**Files:**
- Create: `apps/frontend/src/lib/time.ts`

- [ ] **Step 1: Write `apps/frontend/src/lib/time.ts`**

```ts
/**
 * Returns a human-readable relative time string.
 * e.g. "just now", "30 seconds ago", "2 minutes ago", "1 hour ago"
 */
export function formatRelativeTime(ms: number): string {
  const seconds = Math.floor((Date.now() - ms) / 1000)

  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds} seconds ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`

  const hours = Math.floor(minutes / 60)
  return hours === 1 ? '1 hour ago' : `${hours} hours ago`
}
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
pnpm --filter frontend exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/lib/time.ts
git commit -m "feat: add formatRelativeTime helper"
```

---

## Task 6: `lib/shiki.ts` — syntax highlighter singleton

**Files:**
- Create: `apps/frontend/src/lib/shiki.ts`

- [ ] **Step 1: Write `apps/frontend/src/lib/shiki.ts`**

```ts
import { createHighlighter } from 'shiki'

// Initialised once at module load — never re-created on component mount/unmount
const highlighterPromise = createHighlighter({
  themes: ['github-dark'],
  langs: ['json'],
})

/**
 * Returns Shiki-highlighted HTML for the given JSON string.
 * The highlighter is a module-level singleton; this function is safe to call
 * multiple times without creating multiple highlighter instances.
 */
export async function highlight(code: string): Promise<string> {
  const highlighter = await highlighterPromise
  return highlighter.codeToHtml(code, { lang: 'json', theme: 'github-dark' })
}
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
pnpm --filter frontend exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/lib/shiki.ts
git commit -m "feat: add Shiki singleton highlight() helper"
```

---

## Task 7: `api/events.ts` — mock data + `useEvents()` hook

**Files:**
- Create: `apps/frontend/src/api/events.ts`

- [ ] **Step 1: Write `apps/frontend/src/api/events.ts`**

```ts
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
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
pnpm --filter frontend exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/api/events.ts
git commit -m "feat: add MOCK_EVENTS and useEvents() hook"
```

---

## Task 8: `EventListItem` component

**Files:**
- Create: `apps/frontend/src/components/EventListItem.tsx`

- [ ] **Step 1: Write `apps/frontend/src/components/EventListItem.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
pnpm --filter frontend exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/EventListItem.tsx
git commit -m "feat: add EventListItem component with type badge and relative timestamp"
```

---

## Task 9: `EventList` component

**Files:**
- Create: `apps/frontend/src/components/EventList.tsx`

- [ ] **Step 1: Write `apps/frontend/src/components/EventList.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
pnpm --filter frontend exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/EventList.tsx
git commit -m "feat: add EventList component"
```

---

## Task 10: `PayloadInspector` component

**Files:**
- Create: `apps/frontend/src/components/PayloadInspector.tsx`

- [ ] **Step 1: Write `apps/frontend/src/components/PayloadInspector.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { highlight } from '../lib/shiki'

interface Props {
  payload: Record<string, unknown> | null
}

export function PayloadInspector({ payload }: Props) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    if (payload === null) {
      setHtml(null)
      return
    }

    let cancelled = false
    const code = JSON.stringify(payload, null, 2)

    highlight(code).then((result) => {
      if (!cancelled) setHtml(result)
    })

    return () => {
      cancelled = true
    }
  }, [payload])

  if (payload === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 text-sm">Select an event to inspect</p>
      </div>
    )
  }

  if (html === null) {
    // Plain text while highlight() is resolving (no flash of unstyled content)
    return (
      <pre className="p-4 text-xs text-gray-300 overflow-auto h-full font-mono">
        {JSON.stringify(payload, null, 2)}
      </pre>
    )
  }

  return (
    <div
      className="h-full overflow-auto text-xs [&_pre]:p-4 [&_pre]:h-full [&_pre]:overflow-auto"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
pnpm --filter frontend exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/PayloadInspector.tsx
git commit -m "feat: add PayloadInspector with Shiki highlighting"
```

---

## Task 11: `EventInspector` component

**Files:**
- Create: `apps/frontend/src/components/EventInspector.tsx`

- [ ] **Step 1: Write `apps/frontend/src/components/EventInspector.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
pnpm --filter frontend exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/EventInspector.tsx
git commit -m "feat: add EventInspector with auto-select and selected state"
```

---

## Task 12: `AuthPanel` component

**Files:**
- Create: `apps/frontend/src/components/AuthPanel.tsx`

- [ ] **Step 1: Write `apps/frontend/src/components/AuthPanel.tsx`**

```tsx
import { SignIn, UserProfile, useUser } from '@clerk/react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined

function ClerkAuthContent() {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 rounded-full border-2 border-gray-600 border-t-gray-300 animate-spin" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-full">
        <SignIn />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full overflow-auto">
      <UserProfile />
    </div>
  )
}

export function AuthPanel() {
  if (!PUBLISHABLE_KEY) {
    // Mock mode — no Clerk key available
    return (
      <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-700 rounded-lg m-4">
        <div className="text-center">
          <p className="text-gray-500 text-sm font-mono">Auth panel</p>
          <p className="text-gray-600 text-xs mt-1">
            Set VITE_CLERK_PUBLISHABLE_KEY to enable
          </p>
        </div>
      </div>
    )
  }

  return <ClerkAuthContent />
}
```

- [ ] **Step 2: Verify TypeScript is happy**

```bash
pnpm --filter frontend exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/AuthPanel.tsx
git commit -m "feat: add AuthPanel with Clerk placeholder for mock mode"
```

---

## Task 13: Wire up `index.tsx` and verify in browser

**Files:**
- Modify: `apps/frontend/src/routes/index.tsx`

- [ ] **Step 1: Replace shell `index.tsx` with the real page**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { AuthPanel } from '../components/AuthPanel'
import { EventInspector } from '../components/EventInspector'

function IndexPage() {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Left: Auth panel */}
      <div className="w-96 shrink-0 border-r border-gray-800">
        <AuthPanel />
      </div>

      {/* Right: Event inspector */}
      <div className="flex-1 min-w-0">
        <EventInspector />
      </div>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: IndexPage,
})
```

- [ ] **Step 2: Start the dev server and verify in the browser**

```bash
pnpm --filter frontend dev
```

Open `http://localhost:5173`. Verify:

1. Dark background fills the viewport
2. Left panel shows the "Auth panel" placeholder (dashed border, label text)
3. Right panel shows the Event Inspector header ("EVENT INSPECTOR")
4. Event list shows 6 rows — each with a coloured badge (`user.created` blue, `user.updated` green, `user.deleted` red), an email address, and a relative timestamp
5. First event is auto-selected (highlighted row)
6. Payload panel shows Shiki-highlighted JSON for the selected event (github-dark theme)
7. Clicking a different row updates the payload panel

- [ ] **Step 3: Verify TypeScript is clean**

```bash
pnpm --filter frontend exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/routes/index.tsx
git commit -m "feat: wire up index page with AuthPanel and EventInspector"
```

---

## Task 14: Final check

- [ ] **Step 1: Run a full build to confirm no type or bundler errors**

```bash
pnpm --filter frontend build
```

Expected: build completes with no errors. Output in `apps/frontend/dist/`.

- [ ] **Step 2: Smoke test the preview build**

```bash
pnpm --filter frontend preview
```

Open `http://localhost:4173`. Verify the same checklist from Task 13 Step 2 passes on the production build.

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "chore: verify production build passes"
```
