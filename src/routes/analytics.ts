import { Router } from "express";
import { validate } from "../middleware/validate";
import { parkSummarySchema, topQueuesSchema } from "../schemas/analytics";
import { prisma } from "../libs/prisma";

/* Syfte:
Analys-endpoints som gör aggregationer över flera tabeller.
Notera att $queryRaw används med parametrar (template-tag) för säker interpolering.
$queryRaw är ett sätt att köra rå SQL via Prisma för (Postgres/MYSQL/SQLite) */

export const analyticsRouter = Router();

// GET /api/analytics/parks/:parkId/summary
analyticsRouter.get(
	"/parks/:parkId/summary",
	validate(parkSummarySchema, ["params"]),
	async (_req, res, next) => {
		try {
			const { params } = (res.locals as any).validated as { params: { parkId: number } };
			const parkId = params.parkId;

			// Aggregat 1: antal attraktioner (total/active/inactive)
			const [totals] = await prisma.$queryRaw<
				Array<{ total: number; active: number; inactive: number }>
			>`
            SELECT 
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE "isActive")::int AS active,
            COUNT(*) FILTER (WHERE NOT "isActive")::int AS inactive
            FROM "Attraction"
            WHERE "parkId" = ${parkId}
            `;

			// Aggregat 2: besökare year-to-date (innevarande år)
			const year = new Date().getFullYear();
			const [visits] = await prisma.$queryRaw<Array<{ ytd: number }>>`
			SELECT COALESCE(SUM("visitors"),0)::int AS ytd
			FROM "Visit"
			WHERE "parkId" = ${parkId} AND EXTRACT(YEAR FROM "visitDate") = ${year}
			`;

			// Aggregat 3: köstatistik senaste 7 dagar
			const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
			const [queues] = await prisma.$queryRaw<
				Array<{ avg: number | null; min: number | null; max: number | null }>
			>`
			SELECT AVG(q."minutes")::float AS avg, MIN(q."minutes")::int AS min, MAX(q."minutes")::int AS max
			FROM "QueueSample" q
			JOIN "Attraction" a ON a."id" = q."attractionId"
			WHERE a."parkId" = ${parkId} AND q."sampledAt" >= ${since}
			`;

			res.json({
				data: {
					attractions: {
						total: totals?.total ?? 0,
						active: totals?.active ?? 0,
						inactive: totals?.inactive ?? 0,
					},
					visitorsYTD: visits?.ytd ?? 0,
					queues7d: {
						avg: queues?.avg ?? null,
						min: queues?.min ?? null,
						max: queues?.max ?? null,
					},
				},
			});
		} catch (err) {
			next(err);
		}
	}
);

// GET /api/analytics/top-queues?days=1&limit=5
analyticsRouter.get("/top-queues", validate(topQueuesSchema, ["query"]), async (_req, res, next) => {
	try {
		const { query } = (res.locals as any).validated as { query: { days: number; limit: number } };
		const since = new Date(Date.now() - query.days * 24 * 3600 * 1000);

		const rows = await prisma.$queryRaw<
			Array<{ id: number; name: string; parkName: string; avgMinutes: number }>
		>`
		SELECT a."id", a."name", p."name" AS "parkName",
        ROUND(AVG(q."minutes"))::int AS "avgMinutes"
        FROM "QueueSample" q
        JOIN "Attraction" a ON a."id" = q."attractionId"
        JOIN "Park" p ON p."id" = a."parkId"
        WHERE q."sampledAt" >= ${since}
        GROUP BY a."id", a."name", p."name"
        ORDER BY AVG(q."minutes") DESC
        LIMIT ${query.limit}
		`;

		res.json({ data: rows });
	} catch (err) {
		next(err);
	}
});
