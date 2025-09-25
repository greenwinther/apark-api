import { z } from "zod";

/* Syfte:
Zod-scheman för Attraction-relaterade endpoints.
Stöder filter på type (enum) och active ("true"/"false") som query params. */

// Enum för typer av attraktioner
export const AttractionType = z.enum(["rollercoaster", "water", "kids"]);

// GET /api/attractions/park/:parkId?type=&active=
// :parkId måste vara positivt heltal.
// type matchar vår enum.
// active är valfritt och accepteras som "true"/"false" (sträng), enklare att skicka från URL.
export const listByParkSchema = z.object({
	params: z.object({
		parkId: z.coerce.number().int().positive(),
	}),
	query: z.object({
		type: AttractionType.optional(),
		active: z.union([z.literal("true"), z.literal("false")]).optional(),
	}),
});
