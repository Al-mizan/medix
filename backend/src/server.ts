import { Server, createServer } from "http";
import app from "./app.js";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seed";
// import { prisma } from "./app/lib/prisma";
import { redisService } from "./app/lib/redis";
import { initSocketIO } from "./app/lib/socket";

let server: Server;
const bootstrap = async () => {
    try {
        // Create the vector extension if it doesn't exist in the database before running the migration
        // await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA public;`;
        await seedSuperAdmin();
        await redisService.connect().catch((error) => {
            console.error("Failed to connect to Redis:", error);
        });
        const httpServer = createServer(app);
        initSocketIO(httpServer);
        server = httpServer.listen(envVars.PORT, () => {
            console.log(
                `Server is running on http://localhost:${envVars.PORT}`,
            );
        });
    } catch (error) {
        console.error("Failed to start server:", error);
    }
};

// SIGTERM signal handler
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received. Shutting down server...");
    if (server) {
        server.close(() => {
            console.log("Server closed gracefully.");
            process.exit(1);
        });
    }
    process.exit(1);
});

// SIGINT signal handler
process.on("SIGINT", () => {
    console.log("SIGINT signal received. Shutting down server...");
    if (server) {
        server.close(() => {
            console.log("Server closed gracefully.");
            process.exit(1);
        });
    }
    process.exit(1);
});

//uncaught exception handler for synchronous code
process.on("uncaughtException", (error) => {
    console.log("Uncaught Exception Detected... Shutting down server", error);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});

// unhandled rejection handler for asynchronous code
process.on("unhandledRejection", (error) => {
    console.log("Unhandled Rejection Detected... Shutting down server", error);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});

bootstrap();
