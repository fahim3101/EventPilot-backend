import mongoose from "mongoose";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

/**
 * Connects to MongoDB with retry logic.
 *
 * Known issue (fixed here): on some networks/ISPs, the `mongodb+srv://`
 * connection string fails because it needs a DNS SRV lookup
 * (querySrv ENOTFOUND / ENODATA). Instead of crashing the whole server,
 * we:
 *  1. Retry a few times with a delay (transient DNS/network hiccups).
 *  2. If it's clearly an SRV/DNS resolution error, print a clear,
 *     actionable message telling the dev to swap to the non-SRV
 *     "standard connection string" from Atlas (see .env.example).
 *  3. Never let an unhandled promise rejection crash the process --
 *     the server logs the error and keeps retrying instead of dying.
 */
export async function connectDB(uri: string, attempt = 1): Promise<void> {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connected (${mongoose.connection.host})`);

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
      connectDB(uri).catch((err) => console.error("Reconnect failed:", err.message));
    });
  } catch (err: any) {
    const message: string = err?.message || String(err);
    const isSrvDnsIssue =
      message.includes("querySrv") ||
      message.includes("ENOTFOUND") ||
      message.includes("ENODATA") ||
      message.includes("getaddrinfo");

    if (isSrvDnsIssue) {
      console.error(
        "\n❌ MongoDB SRV/DNS lookup failed. This usually happens on networks/routers " +
          "that block SRV DNS record queries (common with mongodb+srv:// on some ISPs).\n" +
          "➡️  Fix: In MongoDB Atlas, go to Connect -> Drivers -> and copy the " +
          "'Standard connection string' (starts with mongodb:// and lists all 3 shard hosts) " +
          "instead of the mongodb+srv:// one. Paste that into MONGODB_URI in your .env file.\n" +
          "See the comment above MONGODB_URI in .env.example for a full example.\n"
      );
    }

    if (attempt < MAX_RETRIES) {
      console.warn(
        `MongoDB connection attempt ${attempt} failed: ${message}. Retrying in ${
          RETRY_DELAY_MS / 1000
        }s... (${attempt}/${MAX_RETRIES})`
      );
      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
      return connectDB(uri, attempt + 1);
    }

    console.error(`❌ Could not connect to MongoDB after ${MAX_RETRIES} attempts.`);
    // Don't crash the whole process on boot failure in dev; let nodemon/ts-node-dev
    // keep the process alive so env vars can be fixed without a hard kill.
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
}
