import { z } from "zod";

export const WebhookEventSchema = z.object({
	id: z.string().uuid(),
	svix_id: z.string(),
	event_type: z.enum(["user.created", "user.updated", "user.deleted"]),
	payload: z.record(z.string(), z.unknown()),
	received_at: z.number(),
});

export type WebhookEvent = z.infer<typeof WebhookEventSchema>;

export const clerkWebhookSchema = z.object({
	data: z.object({
		id: z.string(),
		object: z.literal("user"),
		first_name: z.string().nullable(),
		last_name: z.string().nullable(),
		username: z.string().nullable(),
		image_url: z.string().url(),
		profile_image_url: z.string().url(),
		has_image: z.boolean(),
		primary_email_address_id: z.string().nullable(),
		primary_phone_number_id: z.string().nullable(),
		primary_web3_wallet_id: z.string().nullable(),
		password_enabled: z.boolean(),
		two_factor_enabled: z.boolean(),
		totp_enabled: z.boolean(),
		backup_code_enabled: z.boolean(),
		public_metadata: z.record(z.any()),
		private_metadata: z.record(z.any()).nullable(),
		unsafe_metadata: z.record(z.any()),
		banned: z.boolean(),
		locked: z.boolean(),
		lockout_expires_in_seconds: z.number().nullable(),
		verification_attempts_remaining: z.number().nullable(),
		updated_at: z.number(),
		created_at: z.number(),
		last_sign_in_at: z.number().nullable(),
		last_active_at: z.number().nullable(),
		legal_accepted_at: z.number().nullable(),
		mfa_disabled_at: z.number().nullable(),
		mfa_enabled_at: z.number().nullable(),
		create_organization_enabled: z.boolean(),
		create_organizations_limit: z.number().nullable(),
		delete_self_enabled: z.boolean(),
		// Arrays are mapped as unknown arrays to maintain flexibility
		email_addresses: z.array(z.any()),
		phone_numbers: z.array(z.any()),
		web3_wallets: z.array(z.any()),
		passkeys: z.array(z.any()),
		external_accounts: z.array(z.any()),
		saml_accounts: z.array(z.any()),
		enterprise_accounts: z.array(z.any()),
		external_id: z.string().nullable(),
	}),
	event_attributes: z.object({
		http_request: z.object({
			client_ip: z.string(),
			user_agent: z.string(),
		}),
	}),
	instance_id: z.string(),
	object: z.literal("event"),
	timestamp: z.number(),
	type: z.string(), // e.g., 'user.created'
});

// Extract the type for your Fastify routes
export type ClerkWebhookEvent = z.infer<typeof clerkWebhookSchema>;
