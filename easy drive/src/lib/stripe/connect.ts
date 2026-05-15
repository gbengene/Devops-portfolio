/**
 * Stripe Connect helpers — Express account management.
 *
 * Flow:
 *   1. createExpressAccount()      → creates a new Express account, returns account ID
 *   2. createOnboardingLink()      → redirect host to Stripe KYC
 *   3. createDashboardLink()       → let onboarded host access their Express dashboard
 *   4. getAccountStatus()          → check charges_enabled / payouts_enabled
 */
import { stripe } from './client'
import type Stripe from 'stripe'

/**
 * Create a new Stripe Connect Express account for a host.
 * Store the returned account ID in profiles.stripe_connect_account_id.
 */
export async function createExpressAccount(params: {
  email: string
  fullName: string
  hostProfileId: string
}): Promise<string> {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'CA',
    email: params.email,
    capabilities: {
      card_payments: { requested: true },
      transfers:     { requested: true },
    },
    business_profile: {
      name: params.fullName,
      mcc: '7514',  // passenger car rentals
      url: process.env.NEXT_PUBLIC_APP_URL,
    },
    metadata: { host_profile_id: params.hostProfileId },
  })
  return account.id
}

/**
 * Generate an account onboarding link.
 * Redirect the host to `url` — Stripe handles identity verification.
 */
export async function createOnboardingLink(params: {
  accountId: string
  returnUrl: string   // where to send host after completing KYC
  refreshUrl: string  // where to send host if link expires
}): Promise<string> {
  const link = await stripe.accountLinks.create({
    account:     params.accountId,
    type:        'account_onboarding',
    return_url:  params.returnUrl,
    refresh_url: params.refreshUrl,
  })
  return link.url
}

/**
 * Generate an Express Dashboard link so the host can view their payouts.
 * Only works if the account is fully onboarded (charges_enabled = true).
 */
export async function createDashboardLink(accountId: string): Promise<string> {
  const link = await stripe.accounts.createLoginLink(accountId)
  return link.url
}

/**
 * Check current Connect account status.
 * Use the `charges_enabled` and `payouts_enabled` flags to gate features.
 */
export async function getAccountStatus(accountId: string): Promise<{
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  requirements: Stripe.Account.Requirements | null
}> {
  const account = await stripe.accounts.retrieve(accountId)
  return {
    chargesEnabled:   account.charges_enabled,
    payoutsEnabled:   account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    requirements:     account.requirements ?? null,
  }
}
