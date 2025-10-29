import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import config from "./config";

import router from "./app/routes";
import notFound from "./app/middlewares/notFound";
import globalErrorHandler from "./app/middlewares/globalErrorHandlers";
import { PaymentController } from "./app/modules/payment/payment.controller";
import { AppointmentService } from "./app/modules/appointment/appointment.service";

const app: Application = express();

/**
 * 🔔 Stripe Webhook Endpoint
 * This route handles incoming Stripe webhook events.
 * It uses `express.raw()` to ensure the request body remains unparsed for signature verification.
 */
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent
);

/**
 * 🌐 CORS Configuration
 * Allow requests from the frontend (localhost:3001) and enable credentials (cookies, auth headers).
 */
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

/**
 * 🧩 Global Middlewares
 * - JSON parser for parsing incoming request bodies
 * - URL-encoded parser for form submissions
 * - Cookie parser for handling client cookies
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * ⏰ Scheduled Cron Job
 * Runs every minute to cancel unpaid appointments automatically.
 * Uses AppointmentService.cancelUnpaidAppointments().
 */
cron.schedule("* * * * *", async () => {
  try {
    console.log("🕒 Cron job triggered at:", new Date());
    await AppointmentService.cancelUnpaidAppointments();
  } catch (err) {
    console.error("❌ Cron job failed:", err);
  }
});

/**
 * 🚀 Main API Routes
 * Prefix all versioned routes under /api/v1
 */
app.use("/api/v1", router);

/**
 * 🏠 Health Check Endpoint
 * A simple endpoint to verify the server status and uptime.
 */
app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "✅ Server is running successfully!",
    environment: config.node_env,
    uptime: `${process.uptime().toFixed(2)} sec`,
    timestamp: new Date().toISOString(),
  });
});

/**
 * ⚠️ Global Error Handler
 * Catches and processes application-wide errors.
 */
app.use(globalErrorHandler);

/**
 * 🚫 404 Not Found Handler
 * Handles requests to undefined routes.
 */
app.use(notFound);

export default app;
