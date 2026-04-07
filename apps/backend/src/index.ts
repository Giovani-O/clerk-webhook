import cors from "@fastify/cors";
import Fastify from "fastify";
import { eventsRoutes } from "./routes/events.js";
import { webhooksRoutes } from "./routes/webhooks.js";

const fastify = Fastify({
	logger: true,
});

await fastify.register(cors, {
	origin: "http://localhost:5173",
	methods: ["GET", "DELETE", "POST"],
});

await fastify.register(eventsRoutes);
await fastify.register(webhooksRoutes);

const port = Number(process.env.PORT ?? 3001);

try {
	await fastify.listen({ port, host: "0.0.0.0" });
} catch (err) {
	fastify.log.error(err);
	process.exit(1);
}
