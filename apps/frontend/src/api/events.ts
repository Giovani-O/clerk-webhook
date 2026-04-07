import { type WebhookEvent, WebhookEventSchema } from "@clerk-webhook/types";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function fetchEvents(): Promise<WebhookEvent[]> {
	const response = await fetch(`${API_URL}/api/events`);
	if (!response.ok) {
		throw new Error(`Failed to fetch events: ${response.status}`);
	}
	const json = await response.json();
	return z.array(WebhookEventSchema).parse(json);
}

export function useEvents() {
	return useQuery({
		queryKey: ["events"],
		queryFn: fetchEvents,
		refetchInterval: 1500,
	});
}
