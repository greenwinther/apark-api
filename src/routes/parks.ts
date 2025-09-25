import { Router } from "express";
import { prisma } from "../libs/prisma";
import { validate } from "../middleware/validate";
import { getParkParams } from "../schemas/park";
import { HttpError } from "../utils/httpError";

/* Syfte: 
Endpoints för parker (lista + hämta per id).
Notera: validering sker via middleware. Läser från res.locals.validated. */

export const parksRouter = Router();

// GET /api/parks?city=Stockholm
// Enkelt filter på city, returnerar alltid 200 med { data: [...] }
parksRouter.get("/", async (req, res, next) => {
	try {
		const city = typeof req.query.city === "string" ? req.query.city : undefined;
		const data = await prisma.park.findMany({
			where: city ? { city: { equals: city, mode: "insensitive" } } : undefined,
			orderBy: { id: "asc" },
		});
		res.json({ data });
	} catch (err) {
		next(err);
	}
});

// GET /api/parks/:id
// Validerar :id. 400 om ogiltigt, 404 om ej hittad.
parksRouter.get("/:id", validate(getParkParams, ["params"]), async (_req, res, next) => {
	try {
		const { params } = (res.locals as any).validated as { params: { id: number } };
		const park = await prisma.park.findUnique({ where: { id: params.id } });
		if (!park) throw new HttpError(404, "Park not found", "NOT_FOUND");
		res.json({ data: park });
	} catch (err) {
		next(err);
	}
});
