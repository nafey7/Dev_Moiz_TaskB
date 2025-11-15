import dotenv from "dotenv";
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import { scraperService } from "./services/scraper";
import { scrapeHandler } from "./controllers/scrapeController";
import { AppError } from "./utils/errors";
import { ErrorResponse } from "./types/index";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/scrape", scrapeHandler);

  app.use((req: Request, res: Response<ErrorResponse>) => {
    res.status(404).json({ error: "Route not found" });
  });

  app.use(
    (
      error: Error | AppError,
      req: Request,
      res: Response<ErrorResponse>,
      next: NextFunction
    ) => {
      console.error("Error:", error);

      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          error: error.message,
        });
        return;
      }

      res.status(500).json({
        error: "Internal server error",
      });
    }
  );

  return app;
}

async function startServer(): Promise<void> {
  try {
    await scraperService.initBrowser();

    const app = createApp();
    const server = app.listen(PORT, () => {
      console.log(
        `Server is running on http://localhost:${PORT} (${NODE_ENV})`
      );
    });

    const gracefulShutdown = async () => {
      console.log("Shutting down gracefully...");
      server.close(async () => {
        console.log("Server closed");
        await scraperService.closeBrowser();
        process.exit(0);
      });
    };

    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

    process.on("uncaughtException", async (error) => {
      console.error("Uncaught Exception:", error);
      await scraperService.closeBrowser();
      process.exit(1);
    });

    process.on("unhandledRejection", async (reason) => {
      console.error("Unhandled Rejection:", reason);
      await scraperService.closeBrowser();
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
