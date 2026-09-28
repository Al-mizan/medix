import { toNodeHandler } from "better-auth/node";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import path from "path";
import { envVars } from "./app/config/env";
import { auth } from "./app/lib/auth";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { IndexRoutes } from "./app/routes";
import qs from "qs";
import { PaymentController } from "./app/module/payment/payment.controller";
import cron from "node-cron";
import { AppointmentService } from "./app/module/appointment/appointment.service";
import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "./app/docs/openapi";
import compression from "compression";
import { rateLimiter } from "./app/middleware/rateLimit";

const app: Application = express();

app.set("query parser", (str: string) => qs.parse(str));

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`))

app.post("/webhook", express.raw({ type: "application/json" }), PaymentController.handleStripeWebhookEvent);

const allowedOrigins =
    envVars.NODE_ENV === "production"
        ? [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL].filter(Boolean)
        : [
              envVars.FRONTEND_URL,
              envVars.BETTER_AUTH_URL,
              "http://localhost:3000",
              "http://localhost:5000",
          ].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(
    compression({
        threshold: 1024,
        filter: (req: Request, res: Response) => {
            if (req.path === "/webhook" || req.originalUrl === "/webhook") {
                return false;
            }
            return compression.filter(req, res);
        },
    })
);

app.use(rateLimiter);

app.use("/api/auth", toNodeHandler(auth))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser())

cron.schedule('*/25 * * * *', async () => {
    try {
        console.log('Running cron job to cancel unpaid appointments...');
        await AppointmentService.cancelUnpaidAppointments();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error('Error occurred while canceling unpaid appointments: ', message);
    }
});

// OpenAPI & Swagger Documentation
app.get("/api/v1/openapi.json", (req: Request, res: Response) => {
    res.status(200).json(openapiSpec);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.use("/api/v1", IndexRoutes);

// Basic route
app.get('/', async (req: Request, res: Response) => {
    res.status(201).json({
        success: true,
        message: "PH Healthcare's API is working",
    })
});

app.use(globalErrorHandler)
app.use(notFound)


export default app;