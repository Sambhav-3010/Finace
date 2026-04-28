import cors from "cors";
import express from "express";

import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import healthRoutes from "./routes/healthRoutes.js";
import queryRoutes from "./routes/queryRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/health", healthRoutes);
app.use("/api", queryRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
