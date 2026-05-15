import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

/**
 * Create or retrieve a Stripe customer for a renter.
 */
export async function getOrCreateStripeCustomer(params: {
  email: string
  name: string
  phone: string
  metadata: { rental_id: string; renter_profile_id: string }
}): Promise<string> {
  const existing = await stripe.customers.search({
    query: `email:'${params.email}' AND metadata['renter_profile_id']:'${params.metadata.renter_profile_id}'`,
    limit: 1,
  })

  if (existing.data.length > 0) return existing.data[0].id

  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    phone: params.phone,
    metadata: params.metadata,
  })
  return customer.id
}

/**
 * Create a weekly recurring subscription for rent.
 * Anchors billing to the day of the week the rental starts.
 */
export async function createWeeklySubscription(params: {
  customerId: string
  weeklyRateCad: number   // in dollars (e.g. 300)
  rentalId: string
  vehiclePlate: string
}): Promise<Stripe.Subscription> {
  // Create a one-time price for this specific weekly rate
  const price = await stripe.prices.create({
    unit_amount: params.weeklyRateCad * 100,   // Stripe uses cents
    currency: 'cad',
    recurring: { interval: 'week' },
    product_data: {
      name: `Easy Drive Weekly Rental — ${params.vehiclePlate}`,
    },
  })

  return stripe.subscriptions.create({
    customer: params.customerId,
    items: [{ price: price.id }],
    payment_behavior: 'default_incomplete',
    payment_settings: { payment_method_types: ['card'] },
    expand: ['latest_invoice.payment_intent'],
    metadata: { rental_id: params.rentalId },
  })
}

/**
 * Create a $500 deposit hold (manual capture — not charged yet).
 * Captured at end of rental minus any deductions, or refunded in full.
 */
export async function createDepositHold(params: {
  customerId: string
  depositCad: number
  rentalId: string
}): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create({
    amount: params.depositCad * 100,
    currency: 'cad',
    customer: params.customerId,
    capture_method: 'manual',               // hold only — capture later
    description: `Security deposit — Easy Drive rental ${params.rentalId}`,
    metadata: { rental_id: params.rentalId, type: 'deposit' },
  })
}

/**
 * Capture the deposit (partially or fully) at end of rental.
 * Pass the amount to capture; Stripe releases the remainder.
 */
export async function captureDeposit(
  paymentIntentId: string,
  captureAmountCad: number
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.capture(paymentIntentId, {
    amount_to_capture: captureAmountCad * 100,
  })
}

/**
 * Cancel (fully release) the deposit hold — used on clean returns.
 */
export async function releaseDeposit(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.cancel(paymentIntentId)
}

/**
 * Cancel the weekly subscription — used when rental ends.
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.cancel(subscriptionId, {
    prorate: false,
  })
}
