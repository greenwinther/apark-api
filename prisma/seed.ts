import { PrismaClient } from "@prisma/client";

/* Syfte:
Seedar en minimal, deterministisk datamängd för lokal utveckling och tester.
Körs via `prisma db seed` (och automatiskt i `prisma migrate reset`).
*/

const prisma = new PrismaClient();

async function main() {
	// Töm tabeller i rätt ordning (barn → förälder) för att undvika FK-konflikter
	await prisma.queueSample.deleteMany();
	await prisma.visit.deleteMany();
	await prisma.attraction.deleteMany();
	await prisma.park.deleteMany();

	// Skapa en park
	const park = await prisma.park.create({
		data: {
			name: "Nordic Funland",
			city: "Stockholm",
			openedAt: new Date("2001-06-15"),
		},
	});

	// Skapa attraktion 1 (rollercoaster)
	const a1 = await prisma.attraction.create({
		data: {
			parkId: park.id,
			name: "Valkyria Lite",
			type: "rollercoaster",
			heightReqCm: 140,
			openedAt: new Date("2010-05-01"),
			isActive: true,
		},
	});

	// Skapa attraktion 2 (water ride)
	const a2 = await prisma.attraction.create({
		data: {
			parkId: park.id,
			name: "Aqua River",
			type: "water",
			heightReqCm: 110,
			openedAt: new Date("2012-07-10"),
			isActive: true,
		},
	});

	// Skapa några besök (för YTD-statistik)
	await prisma.visit.createMany({
		data: [
			{ parkId: park.id, visitDate: new Date("2025-09-01"), visitors: 1200 },
			{ parkId: park.id, visitDate: new Date("2025-09-02"), visitors: 1500 },
			{ parkId: park.id, visitDate: new Date("2025-09-03"), visitors: 1700 },
		],
	});

	// Hjälpare: generera tidpunkter X minuter bakåt i tiden (för köprov)
	const now = Date.now();
	const t = (minsAgo: number) => new Date(now - minsAgo * 60_000);

	// Skapa köprov de senaste timmarna (för queue-analytics)
	await prisma.queueSample.createMany({
		data: [
			{ attractionId: a1.id, sampledAt: t(180), minutes: 35 },
			{ attractionId: a1.id, sampledAt: t(60), minutes: 50 },
			{ attractionId: a2.id, sampledAt: t(75), minutes: 20 },
			{ attractionId: a2.id, sampledAt: t(20), minutes: 25 },
		],
	});

	console.log("✅ Seed done");
}

// Kör seeden och stäng alltid DB-klienten till sist
main().finally(() => prisma.$disconnect());
