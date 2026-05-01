import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { attachRequestContext } from "./middlewares/requestContext.js";
import apiRouter from "./routes/index.js";

const app = express();

app.disable("x-powered-by");
app.use(attachRequestContext);
app.use(
  cors({
    origin: env.corsOrigins.length > 0 ? env.corsOrigins : true,
    credentials: true,
  })
);
app.use(express.json({ limit: env.jsonBodyLimit }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: env.serviceName,
    environment: env.nodeEnv,
  });
});

app.use(env.apiPrefix, apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
