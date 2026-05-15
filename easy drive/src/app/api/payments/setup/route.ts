import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, requireAdminSession } from '@/lib/supabase/server'
import {
  getOrCreateStripeCustomer,
  createWeeklySubscription,
  createDepositHold,
} from '@/lib/stripe'
import { z } from 'zod'

const SetupSchema = z.object({
  rentalId: z.string().uuid(),
})

/**
 * POST /api/payments/setup
 * Admin only — initialise Stripe billing for an approved rental.
 *
 * Flow:
 *  1. Create/retrieve Stripe customer for renter
 *  2. Create weekly subscription (pending payment method collection)
 *  3. Create $500 deposit hold (manual capture)
 *  4. Store Stripe IDs on rental record
 *  5. Update rental status → pending_signature (payment set up, awaiting signed doc)
 *
 * The renter then adds their payment method via Stripe's hosted page,
 * which triggers the subscription to activate.
 */
export async function POST(req: NextRequest) {
  await requireAdminSession()

  const body = await req.json()
  const parsed = SetupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: rental } = await supabase
    .from('rentals')
    .select(`
      id, weekly_rate_cad, deposit_cad, status,
      vehicle_id, vehicles!vehicle_id(plate_number),
      renter_id, profiles!renter_id(full_name, phone, email)
    `)
    .eq('id', parsed.data.rentalId)
    .single() as { data: any }

  if (!rental) return NextResponse.json({ error: 'Rental not found' }, { status: 404 })
  if (rental.status !== 'pending_payment') {
    return NextResponse.json({ error: 'Rental is not in pending_payment status' }, { status: 409 })
  }

  const renter  = rental.profiles
  const vehicle = rental.vehicles

  // 1. Stripe customer
  const stripeCustomerId = await getOrCreateStripeCustomer({
    email:    renter.email,
    name:     renter.full_name,
    phone:    renter.phone,
    metadata: { rental_id: rental.id, renter_profile_id: rental.renter_id },
  })

  // 2. Weekly subscription
  const subscription = await createWeeklySubscription({
    customerId:    stripeCustomerId,
    weeklyRateCad: rental.weekly_rate_cad,
    rentalId:      rental.id,
    vehiclePlate:  vehicle.plate_number,
  })

  // 3. Deposit hold
  const depositIntent = await createDepositHold({
    customerId: stripeCustomerId,
    depositCad: rental.deposit_cad,
    rentalId:   rental.id,
  })

  // 4. Store Stripe IDs + update status
  await supabase
    .from('rentals')
    .update({
      stripe_customer_id:       stripeCustomerId,
      stripe_subscription_id:   subscription.id,
      stripe_deposit_intent_id: depositIntent.id,
      status:                   'pending_signature',
    })
    .eq('id', rental.id)

  // Return client secret so renter can add their card via Stripe Elements
  const invoice    = subscription.latest_invoice as any
  const clientSecret = invoice?.payment_intent?.client_secret ?? null

  return NextResponse.json({
    stripeCustomerId,
    subscriptionId:       subscription.id,
    depositIntentId:      depositIntent.id,
    depositClientSecret:  depositIntent.client_secret,
    subscriptionClientSecret: clientSecret,
  })
}
