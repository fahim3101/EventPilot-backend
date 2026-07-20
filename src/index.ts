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
// CORS: allow a comma-separated list of origins in CLIENT_URL.
// Strips any trailing slash so "https://app.com/" and "https://app.com"
// are treated as the same origin (browsers are strict about this).
const rawOrigins = process.env.CLIENT_URL || "http://localhost:3000";
const allowedOrigins = rawOrigins
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin / curl / server-to-server (no Origin header).
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
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
