/**
 * Split charge helpers — marketplace weekly subscription with 80/20 split.
 *
 * Platform takes 20% application_fee_percent.
 * Host receives 80% via transfer_data.destination.
 *
 * The renter is charged directly; the platform fee is collected automatically
 * before funds are transferred to the host's Express account.
 */
import { stripe } from './client'
import type Stripe from 'stripe'

/**
 * Ensure a Stripe customer exists for the renter (used for subscription billing).
 */
export async function getOrCreateStripeCustomer(params: {
  email: string
  name: string
  phone: string
  metadata: { booking_id: string; renter_profile_id: string }
}): Promise<string> {
  const existing = await stripe.customers.search({
    query: `email:'${params.email}' AND metadata['renter_profile_id']:'${params.metadata.renter_profile_id}'`,
    limit: 1,
  })
  if (existing.data.length > 0) return existing.data[0].id

  const customer = await stripe.customers.create({
    email:    params.email,
    name:     params.name,
    phone:    params.phone,
    metadata: params.metadata,
  })
  return customer.id
}

/**
 * Create a weekly recurring subscription with a 20% platform fee.
 * The host's Connect account ID is required for transfer_data.destination.
 *
 * application_fee_percent: 20  →  platform collects 20%
 * transfer_data.destination    →  remaining 80% flows to host Connect account
 */
export async function createWeeklySubscription(params: {
  customerId:           string
  weeklyRateCad:        number   // dollars (e.g. 350)
  bookingId:            string
  vehiclePlate:         string
  hostConnectAccountId: string   // host's stripe_connect_account_id
}): Promise<Stripe.Subscription> {
  // Create a one-off price for this exact rate
  const price = await stripe.prices.create({
    unit_amount: params.weeklyRateCad * 100,
    currency:    'cad',
    recurring:   { interval: 'week' },
    product_data: {
      name: `Easy Drive Weekly Booking — ${params.vehiclePlate}`,
    },
  })

  return stripe.subscriptions.create({
    customer:            params.customerId,
    items:               [{ price: price.id }],
    payment_behavior:    'default_incomplete',
    payment_settings:    { payment_method_types: ['card'] },
    expand:              ['latest_invoice.payment_intent'],
    application_fee_percent: 20,
    transfer_data: {
      destination: params.hostConnectAccountId,
    },
    metadata: { booking_id: params.bookingId },
  })
}

/**
 * Cancel the weekly subscription when a booking ends.
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.cancel(subscriptionId, { prorate: false })
}
