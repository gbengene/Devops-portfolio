import { NextRequest, NextResponse } from 'next/server'
import { constructStandardEvent, constructConnectEvent } from '@/lib/stripe/webhooks'
import { createAdminClient } from '@/lib/supabase/server'
import { notify } from '@/lib/notifications'
import type { Stripe } from '@/lib/stripe/webhooks'

/**
 * POST /api/webhooks/stripe
 *
 * Handles both standard and Connect webhook events from Stripe.
 * The event source is determined by checking which secret verifies the signature.
 *
 * Standard events handled:
 *   - invoice.payment_succeeded       → record weekly rent payment (with split amounts)
 *   - invoice.payment_failed          → record failure, alert admin + renter
 *   - customer.subscription.deleted   → mark booking ended
 *
 * Connect events handled:
 *   - account.updated                 → update stripe_connect_status on profile
 *   - transfer.created                → record transfer ID on payment
 *   - payout.paid                     → insert payout record for host
 *   - payment_intent.payment_failed   → notify on deposit hold failure
 *
 * Security: always verify signature before reading event data.
 * Webhooks are the single source of truth for payment state.
 */
export async function POST(req: NextRequest) {
  const rawBody  = await req.text()
  const sig      = req.headers.get('stripe-signature') ?? ''

  // Try standard webhook first, then Connect webhook
  let event: ReturnType<typeof constructStandardEvent>
  let isConnect = false

  try {
    event = constructStandardEvent(rawBody, sig)
  } catch {
    try {
      event = constructConnectEvent(rawBody, sig)
      isConnect = true
    } catch {
      return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 401 })
    }
  }

  const supabase = createAdminClient()

  // ── Standard events ───────────────────────────────────────────────────────

  if (!isConnect) {
    switch (event.type) {

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe['Invoice']
        const subscriptionId = invoice.subscription as string
        if (!subscriptionId) break

        const { data: booking } = await supabase
          .from('bookings')
          .select('id, weekly_rate_cad, platform_fee_cad, host_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single() as { data: {
            id: string
            weekly_rate_cad: number
            platform_fee_cad: number
            host_id: string
          } | null }

        if (!booking) {
          // Fallback: check old rentals table (backward compat with v1.0 data)
          const { data: rental } = await supabase
            .from('rentals')
            .select('id')
            .eq('stripe_subscription_id', subscriptionId)
            .single()

          if (rental) {
            await supabase.from('payments').insert({
              rental_id:                rental.id,
              type:                     'weekly_rent',
              amount_cad:               Math.round((invoice.amount_paid ?? 0) / 100),
              status:                   'paid',
              stripe_payment_intent_id: invoice.payment_intent as string,
              stripe_invoice_id:        invoice.id,
              paid_at:                  new Date().toISOString(),
            })
          }
          break
        }

        const totalCad    = Math.round((invoice.amount_paid ?? 0) / 100)
        const platformCad = booking.platform_fee_cad
        const hostCad     = totalCad - platformCad

        await supabase.from('payments').insert({
          booking_id:               booking.id,
          type:                     'weekly_rent',
          amount_cad:               totalCad,
          amount_total_cad:         totalCad,
          amount_host_cad:          hostCad,
          amount_platform_cad:      platformCad,
          status:                   'paid',
          stripe_payment_intent_id: invoice.payment_intent as string,
          stripe_invoice_id:        invoice.id,
          paid_at:                  new Date().toISOString(),
        } as any)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe['Invoice']
        const subscriptionId = invoice.subscription as string
        if (!subscriptionId) break

        // Check bookings (v2) first, then rentals (v1 fallback)
        const { data: booking } = await supabase
          .from('bookings')
          .select('id, vehicle_id, renter_id, vehicles!vehicle_id (plate_number), renter:profiles!renter_id (full_name, phone)')
          .eq('stripe_subscription_id', subscriptionId)
          .single() as { data: any }

        if (booking) {
          await supabase.from('payments').insert({
            booking_id:       booking.id,
            type:             'weekly_rent',
            amount_cad:       Math.round((invoice.amount_due ?? 0) / 100),
            status:           'failed',
            stripe_invoice_id: invoice.id,
            failure_reason:   invoice.last_finalization_error?.message ?? 'Unknown',
          } as any)

          await supabase.from('alerts').insert({
            vehicle_id: booking.vehicle_id,
            type:       'payment_failed',
            severity:   'critical',
            message:    `Weekly payment failed for renter ${booking.renter?.full_name} — vehicle ${booking.vehicles?.plate_number}.`,
            audience:   'admin',
          } as any)

          await notify.paymentFailed({
            renterPhone: booking.renter?.phone ?? '',
            renterName:  booking.renter?.full_name ?? 'Renter',
            plate:       booking.vehicles?.plate_number ?? '',
            rentalId:    booking.id,
          })
          break
        }

        // v1 fallback
        const { data: rental } = await supabase
          .from('rentals')
          .select('id, vehicle_id, vehicles(plate_number), profiles!renter_id(full_name, phone)')
          .eq('stripe_subscription_id', subscriptionId)
          .single() as { data: any }

        if (rental) {
          await supabase.from('payments').insert({
            rental_id:        rental.id,
            type:             'weekly_rent',
            amount_cad:       Math.round((invoice.amount_due ?? 0) / 100),
            status:           'failed',
            stripe_invoice_id: invoice.id,
            failure_reason:   invoice.last_finalization_error?.message ?? 'Unknown',
          })

          await notify.paymentFailed({
            renterPhone: rental.profiles?.phone ?? '',
            renterName:  rental.profiles?.full_name ?? 'Renter',
            plate:       rental.vehicles?.plate_number ?? '',
            rentalId:    rental.id,
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe['Subscription']

        // End booking (v2)
        await supabase
          .from('bookings')
          .update({ status: 'completed' })
          .eq('stripe_subscription_id', subscription.id)
          .eq('status', 'active')

        // End rental (v1 fallback)
        await supabase
          .from('rentals')
          .update({ status: 'ended', end_date: new Date().toISOString().split('T')[0] })
          .eq('stripe_subscription_id', subscription.id)
          .eq('status', 'active')
        break
      }
    }
  }

  // ── Connect events ────────────────────────────────────────────────────────

  if (isConnect) {
    switch (event.type) {

      case 'account.updated': {
        const account = event.data.object as Stripe['Account']
        const hostProfileId = account.metadata?.host_profile_id
        if (!hostProfileId) break

        const newStatus = account.charges_enabled && account.payouts_enabled
          ? 'onboarded'
          : account.details_submitted
          ? 'onboarding'
          : 'not_started'

        await supabase
          .from('profiles')
          .update({ stripe_connect_status: newStatus })
          .eq('id', hostProfileId)
        break
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe['Transfer']
        // Update the payment record with the transfer ID for reconciliation
        if (transfer.source_transaction) {
          await supabase
            .from('payments')
            .update({ stripe_transfer_id: transfer.id })
            .eq('stripe_payment_intent_id', transfer.source_transaction as string)
        }
        break
      }

      case 'payout.paid': {
        const payout = event.data.object as Stripe['Payout']
        // Stripe Connect payouts fire on the connected account
        // Find host by stripe_connect_account_id via metadata if available
        // The connected account ID is on event.account for Connect events
        const connectedAccountId = (event as any).account as string | undefined
        if (!connectedAccountId) break

        const { data: host } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_connect_account_id', connectedAccountId)
          .single()

        if (!host) break

        await supabase.from('payouts').insert({
          host_id:         host.id,
          stripe_payout_id: payout.id,
          amount_cad:      Math.round(payout.amount / 100),
          status:          'paid',
          arrival_date:    new Date(payout.arrival_date * 1000).toISOString().split('T')[0],
        } as any)
        break
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe['PaymentIntent']
        if (pi.metadata?.type !== 'deposit') break

        const bookingId = pi.metadata?.booking_id
        if (!bookingId) break

        const { data: booking } = await supabase
          .from('bookings')
          .select('vehicle_id, renter:profiles!renter_id (full_name, phone)')
          .eq('id', bookingId)
          .single() as { data: any }

        if (booking?.renter?.phone) {
          const { sendSMS } = await import('@/lib/notifications')
          await sendSMS(
            booking.renter.phone,
            `Easy Drive: Your security deposit payment failed. Please update your payment method in the app to continue with your booking.`
          ).catch(console.error)
        }
        break
      }
    }
  }

  return NextResponse.json({ received: true })
}
