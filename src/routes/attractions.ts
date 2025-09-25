import { Router } from "express";
import { validate } from "../middleware/validate";
import { listByParkSchema } from "../schemas/attraction";
import { prisma } from "../libs/prisma";

/* Syfte:
Endpoints för attraktioner kopplade till parker.
Stöder filter: type (string/enum), active ("true"/"false"). */

export const attractionsRouter = Router();

// GET /api/attractions/park/:parkId?type=rollercoaster&active=true
attractionsRouter.get(
	"/park/:parkId",
	validate(listByParkSchema, ["params", "query"]),
	async (_req, res, next) => {
		try {
			// Validerade värden (inga req.*)
			const { params, query } = (res.locals as any).validated as {
				params: { parkId: number };
				query: { type?: string; active?: "true" | "false" };
			};

			const data = await prisma.attraction.findMany({
				where: {
					parkId: params.parkId,
					...(query.type ? { type: query.type } : {}),
					...(query.active !== undefined ? { isActive: query.active === "true" } : {}),
				},
				orderBy: { id: "asc" },
			});

			res.json({ data });
		} catch (err) {
			next(err);
		}
	}
);
