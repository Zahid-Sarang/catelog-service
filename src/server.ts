import config from "config";
import app from "./app";
import { initDb } from "./config/db";
import logger from "./config/logger";

const startServer = async () => {
    const PORT: number = config.get("server.port") || 5502;
    try {
        await initDb();
        logger.info("Database connected sucessFully!");
        app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            logger.on("finish", () => {
                process.exit(1);
            });
        }
    }
};

void startServer();
