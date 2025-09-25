import { Router } from "express";
import { prisma } from "../libs/prisma";
import { validate } from "../middleware/validate";
import { parkSummarySchema, topQueuesSchema } from "../schemas/analytics";

/* Syfte:
Samma endpoints som analytics.ts men utan rå SQL.
Vi använder Prisma's aggregations-API och lite JS-beräkningar. */

export const analyticsOrmRouter = Router();

// GET /api/analytics-orm/parks/:parkId/summary
analyticsOrmRouter.get(
	"/parks/:parkId/summary",
	validate(parkSummarySchema, ["params"]),
	async (_req, res, next) => {
		try {
			const { params } = (res.locals as any).validated as { params: { parkId: number } };
			const parkId = params.parkId;

			// 1) attractions totals/active/inactive (utan rå SQL)
			const [total, active] = await Promise.all([
				prisma.attraction.count({ where: { parkId } }),
				prisma.attraction.count({ where: { parkId, isActive: true } }),
			]);
			const inactive = total - active;

			// 2) visitors YTD (utan EXTRACT)
			const year = new Date().getFullYear();
			const start = new Date(year, 0, 1);
			const end = new Date(year + 1, 0, 1);
			const sum = await prisma.visit.aggregate({
				where: { parkId, visitDate: { gte: start, lt: end } },
				_sum: { visitors: true },
			});
			const visitorsYTD = sum._sum.visitors ?? 0;

			// 3) queue statistik senaste 7 dagar
			const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
			const samples = await prisma.queueSample.findMany({
				where: {
					sampledAt: { gte: since },
					attraction: { parkId },
				},
				select: { minutes: true },
			});
			const mins = samples.map((s) => s.minutes);
			const avg = mins.length ? mins.reduce((a, b) => a + b, 0) / mins.length : null;
			const min = mins.length ? Math.min(...mins) : null;
			const max = mins.length ? Math.max(...mins) : null;

			res.json({
				data: {
					attractions: { total, active, inactive },
					visitorsYTD,
					queues7d: { avg, min, max },
				},
			});
		} catch (err) {
			next(err);
		}
	}
);

// GET /api/analytics-orm/top-queues?days=7&limit=5
analyticsOrmRouter.get("/top-queues", validate(topQueuesSchema, ["query"]), async (_req, res, next) => {
	try {
		const { query } = (res.locals as any).validated as { query: { days: number; limit: number } };
		const since = new Date(Date.now() - query.days * 24 * 3600 * 1000);

		// Hämta samples + attraction + park, aggregera i JS
		const rows = await prisma.queueSample.findMany({
			where: { sampledAt: { gte: since } },
			select: {
				minutes: true,
				attraction: {
					select: {
						id: true,
						name: true,
						park: { select: { name: true } },
					},
				},
			},
		});

		// Grupp-aggregat: { attractionId: { name, parkName, sum, count } }
		const map = new Map<number, { name: string; parkName: string; sum: number; count: number }>();
		for (const r of rows) {
			const id = r.attraction.id;
			const cur = map.get(id) ?? {
				name: r.attraction.name,
				parkName: r.attraction.park.name,
				sum: 0,
				count: 0,
			};
			cur.sum += r.minutes;
			cur.count += 1;
			map.set(id, cur);
		}

		const agg = Array.from(map.entries()).map(([id, v]) => ({
			id,
			name: v.name,
			parkName: v.parkName,
			avgMinutes: Math.round(v.sum / v.count),
		}));

		// Sortera och begränsa
		agg.sort((a, b) => b.avgMinutes - a.avgMinutes);
		res.json({ data: agg.slice(0, query.limit) });
	} catch (err) {
		next(err);
	}
});
