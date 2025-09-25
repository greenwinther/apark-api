import { z } from "zod";

/* Syfte:
Zod-scheman för Park-relaterade endpoints.
Notera: z.coerce.number() används för att acceptera strängar från URL (":id" som number). */

// GET /api/parks/:id
// :id måste vara ett positivt heltal.
// z.coerce.number() gör att "1" (string) blir 1 (number).
export const getParkParams = z.object({
	params: z.object({
		id: z.coerce.number().int().positive(),
	}),
});
