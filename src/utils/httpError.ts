/* Syfte:
Typad felklass för "förväntade" HTTP-fel (400/401/404...).
Fördel: routes kan throw:a HttpError och error-middleware mappar till JSON-svar. */

export class HttpError extends Error {
	// HTTP status code (t.ex. 404)
	status: number;
	// Kort feltyp ("NOT_FOUND", "VALIDATION_ERROR" ...)
	type: string;
	// Valfria extra detaljer (t.ex. Zod-felträd)
	details?: unknown;

	constructor(status: number, message: string, type = "ERROR", details?: unknown) {
		super(message);
		this.name = "HttpError";
		this.status = status;
		this.type = type;
		this.details = details;

		// Fixar prototypkedjan i TS/Node (annars kan instanceof bete sig konstigt)
		Object.setPrototypeOf(this, new.target.prototype);

		// Trimma stacken (node >= v16 har captureStackTrace)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, HttpError);
		}
	}
}
