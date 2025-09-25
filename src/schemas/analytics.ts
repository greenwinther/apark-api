import { z } from "zod";

// Syfte: Zod-scheman för Analytics-endpoints.

// GET /api/analytics/parks/:parkId/summary
// :parkId måste vara positivt heltal.
export const parkSummarySchema = z.object({
	params: z.object({
		parkId: z.coerce.number().int().positive(),
	}),
});

// GET /api/analytics/top-queues?days=&limit=
// days: antal dagar bakåt i tiden, default 1.
// limit: max antal rader, default 5, max 50 för att skydda DB.
export const topQueuesSchema = z.object({
	query: z.object({
		days: z.coerce.number().int().positive().default(1),
		limit: z.coerce.number().int().positive().max(50).default(5),
	}),
});
