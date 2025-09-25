import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError.js";
import { logger } from "../config/logger.js";

/* Syfte: 
Centralt fel-hanteringslager för Express.
Mappar konsekventa fel som JSON-svar.
Loggar 4xx som warn och 5xx som error med Pino.
Undviker att läcka stacktraces till klient (säkerhet). */

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
	res.setHeader("Content-Type", "application/json; charset=utf-8");

	if (err instanceof HttpError) {
		const payload = { type: err.type, message: err.message, details: err.details ?? null };
		const log = err.status >= 500 ? logger.error.bind(logger) : logger.warn.bind(logger);
		log({ err, status: err.status }, "Handled HttpError");
		return res.status(err.status).json({ error: payload });
	}

	if (err instanceof Error) {
		logger.error({ err }, "Unhandled Error");
		return res.status(500).json({ error: { type: "INTERNAL", message: "Unexpected error" } });
	}

	logger.error({ err }, "Unknown error type");
	return res.status(500).json({ error: { type: "INTERNAL", message: "Unknown error" } });
}
