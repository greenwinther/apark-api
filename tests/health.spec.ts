import request from "supertest";
import { app } from "../src/app";
import { describe, expect, it } from "vitest";

// Syfte: Verifierar att /healthz endpointen svarar 200 och returnerar ok:true + uptime.

describe("healthz", () => {
	it("returns ok:true", async () => {
		// Skicka GET mot Express-appen in-memory (ingen port öppnas)
		const res = await request(app).get("/healthz").expect(200);

		// Grundläggande form- och typkontroller
		expect(res.body).toHaveProperty("ok", true);
		expect(typeof res.body.uptime).toBe("number");
	});
});
