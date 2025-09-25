import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { HttpError } from "../utils/httpError";

/* Syfte: 
Validera inkommande data (params, query, body) med Zod.
Viktigt i Express 5: req.query/req.params är read-only getters.
=> Skriv ALDRIG tillbaka på req.*. Lägg validerat resultat i res.locals.validated. */

// Hjälpertyp: plocka ut den parse:ade datan från valideringen
export const validate =
	(schema: z.ZodTypeAny, pick: Array<"params" | "query" | "body">) =>
	(req: Request, res: Response, next: NextFunction) => {
		// Plocka ihop de delar som ska validera
		const data: Record<string, unknown> = {};
		for (const k of pick) data[k] = (req as any)[k];

		// Safe-parse för att få snyggt fel
		const parsed = schema.safeParse(data);
		if (!parsed.success) {
			// treeifyError ger ett trevligt, nyckelbaserat "träd" med fel-objekt
			const details = z.treeifyError(parsed.error);
			throw new HttpError(400, "Validation failed", "VALIDATION_ERROR", details);
		}

		// Spara validerad data i res.locals (inte på req.*!)
		(res.locals as any).validated = parsed.data;
		next();
	};
