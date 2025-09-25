import request from "supertest";
import { prisma } from "../src/libs/prisma";
import { app } from "../src/app";
import { afterAll, describe, expect, it } from "vitest";

/// Syfte: Läs-endpoints för parker: lista, filter, hämta per id, samt felvägar (404, 400).

describe("parks endpoints", () => {
	// Stäng Prisma-klienten efter att just denna filens tester är klara (bra hygien)
	afterAll(async () => {
		await prisma.$disconnect();
	});

	it("GET /api/parks returns array with at least one park", async () => {
		const res = await request(app).get("/api/parks").expect(200);
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBeGreaterThan(0);
	});

	it("GET /api/parks?city=... filters by city", async () => {
		// Hämta alla parker
		const all = await request(app).get("/api/parks").expect(200);
		expect(all.body.data.length).toBeGreaterThan(0);

		// Välj en verklig stad från seedad data
		const city: string = all.body.data[0].city;

		// Filtrera med den staden
		const res = await request(app)
			.get(`/api/parks?city=${encodeURIComponent(city)}`)
			.expect(200);

		// Verifiera: inte tomt OCH alla matchar staden
		expect(res.body.data.length).toBeGreaterThan(0);
		expect(res.body.data.every((p: any) => p.city === city)).toBe(true);
	});

	it("GET /api/parks/:id returns the park", async () => {
		const res = await request(app).get("/api/parks/1").expect(200);
		// Kontrollera att svar innehåller en park med id 1 (seedad)
		expect(res.body.data).toMatchObject({ id: 1, name: expect.any(String) });
	});

	it("GET /api/parks/:id 404s for unknown id", async () => {
		const res = await request(app).get("/api/parks/9999").expect(404);
		// 404 mappas till konsekvent fel-envelop
		expect(res.body.error?.type).toBe("NOT_FOUND");
	});

	it("GET /api/parks/:id 400s for invalid id", async () => {
		const res = await request(app).get("/api/parks/abc").expect(400);
		// 400 pga Zod-validering (id måste vara positivt heltal)
		expect(res.body.error?.type).toBe("VALIDATION_ERROR");
	});
});
