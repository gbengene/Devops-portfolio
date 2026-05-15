/**
 * Server-side Stripe SDK initialisation.
 * Import { stripe } from here — never call new Stripe() elsewhere.
 * The secret key stays server-side only; never expose it to the browser.
 */
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})
