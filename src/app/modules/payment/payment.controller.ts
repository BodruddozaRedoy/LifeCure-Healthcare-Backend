import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { PaymentService } from "./payment.service";
import sendResponse from "../../shared/sendResponse";
import { stripe } from "../../helpers/stripe";

/**
 * 💳 PaymentController
 * -----------------------------------------------------
 * Handles payment-related operations, including the processing
 * of Stripe webhook events for payment confirmation.
 */

/**
 * ⚡ handleStripeWebhookEvent
 * -----------------------------------------------------
 * Receives and verifies incoming webhook events from Stripe.
 * Processes events such as successful payments, refunds, etc.
 *
 * Steps:
 * 1. Validate the Stripe webhook signature.
 * 2. Pass the verified event to the PaymentService for handling.
 * 3. Respond with a success message if everything is valid.
 *
 * @param req - Express Request object with raw body from Stripe
 * @param res - Express Response object
 */
const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {
  // Extract and validate Stripe signature
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret =
    "whsec_7aa0e876564d7172ed1ebbda82f18cd6c740ac93ff44efecbf654c0d71bf3f1c"; // ⚠️ Ideally stored in environment variables

  let event;
  try {
    // Verify webhook signature using Stripe SDK
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Process event data via PaymentService
  const result = await PaymentService.handleStripeWebhookEvent(event);

  // Respond with success confirmation
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Webhook request processed successfully!",
    data: result,
  });
});

/**
 * 📦 Export PaymentController
 * -----------------------------------------------------
 * Exposes controller methods for handling Stripe webhook events.
 */
export const PaymentController = {
  handleStripeWebhookEvent,
};
