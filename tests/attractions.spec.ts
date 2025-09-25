import request from "supertest";
import { app } from "../src/app";
import { describe, expect, it } from "vitest";

// Syfte: Attraktioner per park + query-filter för type och active.

describe("attractions by park", () => {
	it("GET /api/attractions/park/1 returns attractions for park 1", async () => {
		const res = await request(app).get("/api/attractions/park/1").expect(200);

		// Formkontroll
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBeGreaterThan(0);

		// Alla rader ska tillhöra parkId=1
		expect(res.body.data.every((a: any) => a.parkId === 1)).toBe(true);
	});

	it("filters by type", async () => {
		// Filtrerar på type=water (enligt Zod-enum i schemat)
		const res = await request(app).get("/api/attractions/park/1?type=water").expect(200);
		expect(res.body.data.every((a: any) => a.type === "water")).toBe(true);
	});

	it("filters by active=true", async () => {
		// Filtrerar på active=true (stringvärde i query mappas till boolean i handlern)
		const res = await request(app).get("/api/attractions/park/1?active=true").expect(200);
		expect(res.body.data.every((a: any) => a.isActive === true)).toBe(true);
	});
});
