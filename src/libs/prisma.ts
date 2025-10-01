// src/libs/prisma.ts
import { PrismaClient, type Prisma } from "@prisma/client";
import { env } from "../config/env";

/* Syfte:
Dela en enda PrismaClient-instans i hela appen (singleton).
Varför: i dev med hot-reload kan det annars bli flera instanser som öppnar många DB-anslutningar.
*/

// Global cache i dev för att behålla samma instans över modul-reloads
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Anpassa loggning per environment (MUTERBAR array, ej readonly tuples)
const logLevels: Prisma.LogLevel[] =
	env.NODE_ENV === "production"
		? ["warn", "error"]
		: env.NODE_ENV === "test"
		? ["error"]
		: ["query", "info", "warn", "error"];

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: logLevels,
	});

// Icke-prod: cacha instansen globalt för att undvika nya connections vid HMR/hot-reload
if (env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

/**
 * Forcerar en DB-anslutning direkt vid uppstart (annars ansluter Prisma "lazy" vid första queryn).
 * Bra om man vill faila tidigt om DB saknas, istället för att upptäcka det vid första requesten.
 */
export async function connectPrisma() {
	await prisma.$connect();
}

/**
 * Stänger ner Prisma-klienten och returnerar connections till poolen (frigör resurser).
 * Anropa i graceful shutdown så processen kan avslutas rent utan hängande DB-anslutningar.
 */
export async function disconnectPrisma() {
	await prisma.$disconnect();
}
