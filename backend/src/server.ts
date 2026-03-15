import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });

    const shutdown = (signal: string) => {
      console.log(`${signal} received. Closing server...`);
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
