# Product Requirements Document — Clerk Webhook Demo

**Date:** 2026-04-07
**Status:** Approved

---

## 1. Purpose

This project is a teaching tool for junior developers to learn how webhooks work in practice. It demonstrates the full lifecycle of a webhook: an event occurs in an external system (Clerk), a signed HTTP request is delivered to a backend endpoint, the payload is verified and persisted, and the frontend reflects the result in near real-time.

The project is intentionally simple. Every architectural decision is made in service of clarity, not production scale.

---

## 2. Goals

- Demonstrate the webhook request/response lifecycle end-to-end
- Show why signature verification matters and how it works (Svix)
- Illustrate idempotent webhook handling (deduplication via `svix_id`)
- Teach how a monorepo shares types between a frontend and backend
- Give a junior developer a working, runnable reference implementation

---

## 3. Target Audience

Junior developers learning backend integrations and event-driven patterns. No prior webhook experience assumed.

---

## 4. Scope

### In scope

- Receiving and verifying `user.created`, `user.updated`, and `user.deleted` Clerk webhook events
- Persisting received events to a local SQLite database
- Displaying a live-updating event inspector on the frontend
- Running entirely on localhost with ngrok as the public tunnel

### Out of scope

- Production deployment
- Authentication on the backend API (the events endpoint is intentionally public for simplicity)
- Pagination of events (last 50 is sufficient for a demo)
- Any billing or payment features

---

## 5. Functional Requirements

### 5.1 Webhook Ingestion

- The backend must expose a `POST /webhooks/clerk` endpoint
- The endpoint must read the raw request body (not parsed JSON) to preserve byte-exact content for Svix signature verification
- The endpoint must verify the Svix signature using `@clerk/backend`'s `verifyWebhook()` helper
- On verification failure the endpoint must return `400 Bad Request` and not write to the database
- On success the endpoint must persist the event to SQLite and return `200 OK`
- If an event with the same `svix_id` already exists (Svix retry), the endpoint must skip the insert and still return `200 OK`

### 5.2 Event Storage

- Events are stored in a single `webhook_events` table in a local SQLite database
- Each row stores: a UUID primary key, the Svix message ID, the event type, the full raw JSON payload, and a received-at timestamp
- The database file is created automatically on backend startup if it does not exist

### 5.3 Event API

- The backend must expose `GET /api/events` returning the last 50 events ordered by `received_at` descending
- Each event in the response includes the full payload (not truncated)
- The backend must expose `DELETE /api/events` to truncate all stored events (demo reset)

### 5.4 Frontend Event Inspector

- The frontend is a single page at `/`
- The left panel renders a Clerk auth component: `<SignIn />` when the user is signed out, `<UserProfile />` when signed in
- The right panel is always visible and shows the Event Inspector regardless of auth state
- The Event Inspector has two sub-panels:
  - **Event list** (left): displays each event as a row with a colour-coded type badge, the user's email address extracted from the payload, and a relative timestamp
  - **Payload inspector** (right): displays the full JSON payload of the selected event with syntax highlighting via Shiki
- When no event is selected, the payload panel shows an empty state: "Select an event to inspect"
- The event list polls `GET /api/events` every 3 seconds via TanStack Query and updates automatically

### 5.5 Triggering Events

Events are triggered by interacting with the Clerk auth components on the same page:

| User action | Webhook event fired |
|---|---|
| Complete sign-up | `user.created` |
| Update profile via UserProfile | `user.updated` |
| Delete account via UserProfile | `user.deleted` |

No separate trigger button is needed. The auth flow is the trigger.

---

## 6. Non-Functional Requirements

- **Local only:** the project runs on localhost; ngrok is required to expose the backend to Clerk
- **No auth on the API:** the events endpoint is public — this is intentional for teaching simplicity
- **No external database:** SQLite with a local file, zero infrastructure setup
- **Stack constraints:** React, TanStack Query, TanStack Router, Fastify, Zod, SQLite, pnpm workspaces

---

## 7. Webhook Event Type Badge Colours

| Event type | Colour |
|---|---|
| `user.created` | Blue |
| `user.updated` | Green |
| `user.deleted` | Red |
