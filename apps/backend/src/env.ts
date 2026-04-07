import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().default(3001),

	CLERK_WEBHOOK_SIGNING_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
