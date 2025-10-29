import Stripe from "stripe";
import config from "../../config";

/**
 * 💳 Stripe Client Initialization
 * -----------------------------------------------------
 * Creates and exports a pre-configured instance of the Stripe SDK.
 *
 * - Uses the secret key from environment variables (via config).
 * - Provides access to all Stripe API methods for handling payments,
 *   subscriptions, webhooks, and other billing-related operations.
 *
 * This instance can be reused throughout the app wherever Stripe is needed.
 */
export const stripe = new Stripe(config.stripeSecretKey as string);
