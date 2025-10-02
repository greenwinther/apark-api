import pino from "pino";
import { env } from "./env.js";

/* Syfte: 
En gemensam Pino-logger som får enhetliga, strukturerade loggar.
Loggnivån styrs av NODE_ENV:
test: "silent" (rent i testruns)
prod: "info" (lagom brusnivå i produktion)
dev: "debug" (mer detaljer för lokal utveckling) */

const isProd = env.NODE_ENV === "production";
const isTest = env.NODE_ENV === "test";

export const logger = pino({
	level: isTest ? "silent" : isProd ? "info" : "debug",
});
