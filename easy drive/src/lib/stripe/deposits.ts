/**
 * Security deposit helpers — manual-capture PaymentIntent.
 *
 * Deposits are NOT revenue. They are a liability held until the vehicle is returned.
 * We use capture_method: 'manual' to hold the funds without charging immediately.
 *
 * Flow:
 *   1. createDepositHold()  — renter authorises $500 hold at booking confirmation
 *   2. captureDeposit()     — admin/host captures partially/fully on damage
 *   3. releaseDeposit()     — admin/host cancels hold on clean return
 */
import { stripe } from './client'
import type Stripe from 'stripe'

/**
 * Place a hold on the renter's card for the security deposit.
 * Does NOT charge the card — funds are reserved but not captured.
 *
 * Important: authorisation expires after 7 days; if the booking is longer,
 * you must re-collect before expiry. For short bookings (≤7 days) this is safe.
 */
export async function createDepositHold(params: {
  customerId:  string
  depositCad:  number    // e.g. 500
  bookingId:   string
}): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create({
    amount:         params.depositCad * 100,
    currency:       'cad',
    customer:       params.customerId,
    capture_method: 'manual',
    description:    `Security deposit — Easy Drive booking ${params.bookingId}`,
    metadata:       { booking_id: params.bookingId, type: 'deposit' },
  })
}

/**
 * Capture the deposit (partially or fully) at end of booking.
 * Pass captureAmountCad ≤ original deposit amount.
 * Stripe automatically releases the uncaptured portion.
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
 * Fully release the deposit hold — use on clean returns with no damage.
 */
export async function releaseDeposit(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.cancel(paymentIntentId)
}
