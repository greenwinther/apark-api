import express from "express";
import helmet from "helmet";
import cors from "cors";
import { apiRouter } from "./routes";
import { errorHandler } from "./middleware/error";

/* Syfte:
Skapa och konfigurera Express-appen (utan att starta HTTP-server).
Servern startas i server.ts så tester kan importera `app` direkt utan att öppna en port. */

export const app = express();

// Body parser för JSON. Viktigt att denna ligger INNAN routers.
app.use(express.json());

// CORS: tillåt cross-origin-anrop (dev-vänligt). Kan låsas ner med origin-lista vid behov.
app.use(cors());

// Säkerhetsheaders (XSS/Clickjacking m.m.). Bra default för API.
app.use(helmet());

// Lättviktig healthcheck för liveness/readiness probes.
app.get("/healthz", (_req, res) => {
	res.json({ ok: true, uptime: process.uptime() });
});

// Prefixa alla API-routes under /api (se src/routes.ts).
app.use("/api", apiRouter);

// Sista middleware: central felhanterare. Måste komma efter alla routes.
app.use(errorHandler);
