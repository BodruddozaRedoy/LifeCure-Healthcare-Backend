import Stripe from "stripe";
import { prisma } from "../../shared/prisma";
import { PaymentStatus } from "@prisma/client";

/**
 * 💳 PaymentService
 * -----------------------------------------------------
 * Handles Stripe webhook event processing and updates
 * related payment and appointment records in the database.
 */

/**
 * ⚡ handleStripeWebhookEvent
 * -----------------------------------------------------
 * Processes verified Stripe webhook events and synchronizes
 * payment data with the application's database.
 *
 * Currently handles:
 *  - `checkout.session.completed`: Marks the payment and
 *    related appointment as PAID or UNPAID based on the
 *    Stripe session status.
 *
 * @param event - Stripe webhook event object
 */
const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    /**
     * ✅ Event: checkout.session.completed
     * -----------------------------------------------------
     * Triggered when a payment checkout is successfully completed.
     * Updates the corresponding appointment and payment records.
     */
    case "checkout.session.completed": {
      const session = event.data.object as any;

      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId;

      // 🧾 Update appointment payment status
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          paymentStatus:
            session.payment_status === "paid"
              ? PaymentStatus.PAID
              : PaymentStatus.UNPAID,
        },
      });

      // 💰 Update payment record with Stripe session data
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status:
            session.payment_status === "paid"
              ? PaymentStatus.PAID
              : PaymentStatus.UNPAID,
          paymentGatewayData: session,
        },
      });

      break;
    }

    /**
     * ⚠️ Default Case
     * -----------------------------------------------------
     * Logs unhandled Stripe events for debugging or future use.
     */
    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }
};

/**
 * 📦 Export PaymentService
 * -----------------------------------------------------
 * Provides payment-related services for webhook handling.
 */
export const PaymentService = {
  handleStripeWebhookEvent,
};
