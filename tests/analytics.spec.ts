import request from "supertest";
import { app } from "../src/app";
import { describe, expect, it } from "vitest";

/* Syfte:
Analytics-aggregationer (summary + top-queues).
Fokuserar på svarens form/typer snarare än exakta siffror (seed kan ändras). */

describe("analytics", () => {
	it("summary for park 1 has expected shape", async () => {
		const res = await request(app).get("/api/analytics/parks/1/summary").expect(200);
		const d = res.body.data;

		// Topnivå-nycklar
		expect(d).toHaveProperty("attractions");
		expect(d).toHaveProperty("visitorsYTD");
		expect(d).toHaveProperty("queues7d");

		// Attraktions-summeringar
		expect(d.attractions).toMatchObject({
			total: expect.any(Number),
			active: expect.any(Number),
			inactive: expect.any(Number),
		});

		// visitorsYTD är numeriskt (YTD = Year-To-Date)
		expect(typeof d.visitorsYTD).toBe("number");

		// Köstatistik har avg/min/max (kan vara null om noll samples)
		expect(d.queues7d).toHaveProperty("avg");
		expect(d.queues7d).toHaveProperty("min");
		expect(d.queues7d).toHaveProperty("max");
	});

	it("top-queues returns an array with id/name/parkName/avgMinutes", async () => {
		const res = await request(app).get("/api/analytics/top-queues?days=7&limit=5").expect(200);
		const rows = res.body.data;
		expect(Array.isArray(rows)).toBe(true);

		// Om det finns rader, kontrollera form
		if (rows.length > 0) {
			const r = rows[0];
			expect(r).toHaveProperty("id");
			expect(r).toHaveProperty("name");
			expect(r).toHaveProperty("parkName");
			expect(r).toHaveProperty("avgMinutes");
		}
	});

	// (Valfritt) Negativ test: okänt parkId returnerar "nollad" summary (inte 404)
	it("summary for unknown park returns zeros", async () => {
		const res = await request(app).get("/api/analytics/parks/9999/summary").expect(200);
		expect(res.body.data.attractions.total).toBe(0);
	});
});
