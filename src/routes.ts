import { Router } from "express";
import { parksRouter } from "./routes/parks";
import { attractionsRouter } from "./routes/attractions";
import { analyticsRouter } from "./routes/analytics";
import { analyticsOrmRouter } from "./routes/analytics.orm";

/* Syfte:
Samla alla feature-routers under /api.
Gör det enkelt att få en överblick över API:ts yta. */

export const apiRouter = Router();
apiRouter.use("/parks", parksRouter);
apiRouter.use("/attractions", attractionsRouter);
apiRouter.use("/analytics", analyticsRouter);
apiRouter.use("/analytics-orm", analyticsOrmRouter);
