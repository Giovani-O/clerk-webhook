import type { FastifyInstance } from "fastify";

export async function webhooksRoutes(fastify: FastifyInstance): Promise<void> {
	// Register a raw body parser for this route so the body arrives as a string.
	// IMPORTANT: Do NOT use the default JSON parser here — Svix signature
	// verification requires the byte-exact raw request body. Parsing it first
	// corrupts the signature check.
	fastify.addContentTypeParser(
		"application/json",
		{ parseAs: "string" },
		(_req, body, done) => {
			done(null, body);
		},
	);

	fastify.post("/webhooks/clerk", async (request, reply) => {
		const rawBody = request.body as string;
		}

		// TODO: Verify the Svix signature using verifyWebhook() from @clerk/backend
		//
		// import { verifyWebhook } from '@clerk/backend/webhooks'
		//
		// const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET
		// if (!secret) throw new Error('CLERK_WEBHOOK_SIGNING_SECRET is not set')
		//
		// let event
		// try {
		//   event = await verifyWebhook(rawBody, {
		//     'svix-id': request.headers['svix-id'] as string,
		//     'svix-timestamp': request.headers['svix-timestamp'] as string,
		//     'svix-signature': request.headers['svix-signature'] as string,
		//   }, secret)
		// } catch {
		//   return reply.code(400).send({ error: 'Invalid signature' })
		// }

		// TODO: Extract event_type and svix_id, insert into DB
		//
		// import { insertEvent } from '../db/events.js'
		// import { randomUUID } from 'node:crypto'
		//
		// await insertEvent({
		//   id: randomUUID(),
		//   svix_id: request.headers['svix-id'] as string,
		//   event_type: event.type,
		//   payload: JSON.stringify(event.data),
		//   received_at: Date.now(),
		// })

		return reply.code(200).send({ received: true });
	});
}
