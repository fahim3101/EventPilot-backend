import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { connectDB } from "./config/db";
import { errorHandler, notFound } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/event.routes";
import aiRoutes from "./routes/ai.routes";

dotenv.config();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/ai", aiRoutes);

app.use(notFound);
app.use(errorHandler);

// Catch anything that slips past asyncHandler (defensive, prevents crashes).
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

const PORT = Number(process.env.PORT) || 5000;

connectDB(process.env.MONGODB_URI as string).then(() => {
  app.listen(PORT, () => console.log(`🚀 EventPilot API running on http://localhost:${PORT}`));
});
