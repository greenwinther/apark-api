import "dotenv/config";
import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectPrisma, disconnectPrisma } from "./libs/prisma";

/* Syfte:
Starta HTTP-servern, (valfritt) initiera DB-anslutning direkt,
och stäng ner allt "gracefully" när processen får en avslutnings-signal. */

// Starta HTTP-servern
const server = app.listen(env.PORT, () => {
	logger.info({ port: env.PORT }, "HTTP server started");

	// (Valfritt) Säkerställ DB-anslutning direkt vid uppstart.
	// Utan detta ansluter Prisma först vid första queryn ("lazy").
	connectPrisma().catch((err) => {
		logger.error({ err }, "Failed to connect to DB on startup");
		process.exit(1);
	});
});

/**
 * Graceful shutdown:
 * - Stoppa HTTP-servern (inga nya connections), vänta in pågående requests.
 * - Koppla ner DB-klienten.
 * - Avsluta processen med rätt exit code.
 */
async function shutdown(signal: string) {
	try {
		logger.warn({ signal }, "Shutting down...");

		// 1) Stäng HTTP-servern (släpper porten när pågående förfrågningar är klara)
		await new Promise<void>((resolve, reject) => {
			server.close((err) => (err ? reject(err) : resolve()));
		});

		// 2) Stäng DB-anslutningar
		await disconnectPrisma();

		logger.warn("Shutdown complete");
		process.exit(0);
	} catch (err) {
		logger.error({ err }, "Shutdown error");
		process.exit(1);
	}
}

/**
 * process.on('SIGINT' | 'SIGTERM'):
 * - 'SIGINT' skickas när du trycker Ctrl+C i terminalen.
 * - 'SIGTERM' skickas oftast av OS/containermiljö (t.ex. Docker/Kubernetes) när processen ska avslutas.
 * Vi fångar dessa signaler för att hinna städa upp (stänga server + DB) innan processen dör.
 */
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
