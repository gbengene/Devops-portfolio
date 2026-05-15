/**
 * Stripe webhook signature verification and event routing.
 *
 * Two webhook endpoints are used:
 *   - STRIPE_WEBHOOK_SECRET         → standard account events
 *   - STRIPE_CONNECT_WEBHOOK_SECRET → Connect account events (account.updated, etc.)
 *
 * Always verify the signature before processing. Webhooks are the source of
 * truth for payment state — never trust client-side "success" claims.
 */
import { stripe } from './client'
import type Stripe from 'stripe'

/**
 * Verify and parse a raw Stripe webhook payload.
 * Throws if the signature is invalid.
 */
export function constructEvent(rawBody: string, signature: string, secret: string): Stripe.Event {
  return stripe.webhooks.constructEvent(rawBody, signature, secret)
}

/**
 * Convenience: verify using the standard webhook secret.
 */
export function constructStandardEvent(rawBody: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  return constructEvent(rawBody, signature, secret)
}

/**
 * Convenience: verify using the Connect webhook secret.
 */
export function constructConnectEvent(rawBody: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET
  if (!secret) throw new Error('STRIPE_CONNECT_WEBHOOK_SECRET is not configured')
  return constructEvent(rawBody, signature, secret)
}

// Re-export Stripe.Event for type use in webhook handlers
export type { Stripe }
