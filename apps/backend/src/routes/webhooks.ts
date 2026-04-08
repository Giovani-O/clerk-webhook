import type { ClerkWebhookEvent } from "@clerk-webhook/types";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import { Webhook } from "svix";
import { insertEvent } from "../db/events.js";
import { env } from "../env.js";

export async function webhooksRoutes(fastify: FastifyInstance): Promise<void> {
	// Register a raw body parser for this route so the body arrives as a string.
	fastify.addContentTypeParser(
		"application/json",
		{ parseAs: "string" },
		(_req, body, done) => {
			done(null, body);
		},
	);

	fastify.post("/webhooks/clerk", async (request: FastifyRequest, reply) => {
		const payload = request.body as string;

		const secret = env.CLERK_WEBHOOK_SIGNING_SECRET;
		console.log("CLERK_WEBHOOK_SIGNING_SECRET", secret);
		if (!secret) throw new Error("CLERK_WEBHOOK_SIGNING_SECRET is not set!");

		const svix_id = request.headers["svix-id"] as string;
		const svix_timestamp = request.headers["svix-timestamp"] as string;
		const svix_signature = request.headers["svix-signature"] as string;

		if (!svix_id || !svix_timestamp || !svix_signature) {
			throw new Error("Missing svix headers!");
		}

		try {
			const webhook = new Webhook(secret);
			const event = (await webhook.verify(payload, {
				"svix-id": svix_id,
				"svix-timestamp": svix_timestamp,
				"svix-signature": svix_signature,
			})) as ClerkWebhookEvent;

			console.log("\n\n", event, "\n\n");

			await insertEvent({
				id: randomUUID(),
				svix_id: request.headers["svix-id"] as string,
				event_type: event.type,
				payload: JSON.stringify(event.data),
				received_at: Date.now(),
			});
		} catch {
			return reply.code(400).send({ error: "Invalid signature" });
		}

		return reply.code(200).send({ received: true });
	});
}
