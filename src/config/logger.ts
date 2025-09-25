import pino from "pino";
import { env } from "./env";

/* Syfte: 
En gemensam Pino-logger som får enhetliga, strukturerade loggar.
Loggnivån styrs av NODE_ENV:
test: "silent" (rent i testruns)
prod: "info" (lagom brusnivå i produktion)
dev: "debug" (mer detaljer för lokal utveckling) */

export const logger = pino({
	level: env.NODE_ENV === "test" ? "silent" : env.NODE_ENV === "production" ? "info" : "debug",
});
