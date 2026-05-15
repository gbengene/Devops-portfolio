# Easy Drive

**Weekly car rentals for GTA gig delivery drivers — no hard credit check.**

A division of GB Trade and Logistics Inc. | Ontario, Canada

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Hosting | Vercel |
| Payments | Stripe (subscriptions + manual-capture deposit holds) |
| GPS | Bouncie API + webhooks |
| SMS | Twilio |
| Email | Resend |
| E-signature | PandaDoc |
| Styling | Tailwind CSS |

---

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier works for dev)
- A [Stripe](https://stripe.com) account (test mode for local dev)
- A [Twilio](https://twilio.com) account with a Canadian phone number
- A [Resend](https://resend.com) account
- A [PandaDoc](https://pandadoc.com) account with a rental agreement template
- A [Bouncie](https://bouncie.com) account with at least one device registered

---

## Local Development Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd "easy drive/src"
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in all values. See [Environment Variables](#environment-variables) below.

### 3. Set up Supabase

**Option A — Supabase CLI (recommended)**

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

**Option B — Supabase dashboard**

1. Go to your Supabase project → SQL Editor
2. Copy and paste the contents of `supabase/migrations/0001_initial_schema.sql`
3. Run the query

### 4. Create the first admin user

After the schema is applied:

```sql
-- Run in Supabase SQL Editor after creating a user via Auth dashboard

INSERT INTO profiles (auth_user_id, role, full_name, email)
VALUES (
  '<your-auth-user-uuid>',   -- from Auth → Users in Supabase dashboard
  'admin',
  'Your Name',
  'your@email.com'
);
```

### 5. Set up Supabase Storage buckets

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public) VALUES ('documents',   'documents',   false);
INSERT INTO storage.buckets (id, name, public) VALUES ('inspections', 'inspections', false);
```

### 6. Configure Stripe webhooks (local)

```bash
# Install Stripe CLI
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy the webhook signing secret printed and paste into STRIPE_WEBHOOK_SECRET
```

### 7. Configure Bouncie webhooks

In your Bouncie dashboard → Webhooks:
- URL: `https://<your-ngrok-url>/api/webhooks/bouncie` (use ngrok for local)
- Events: `geofenceExit`, `ignitionOn`, `ignitionOff`, `speeding`

For local testing with ngrok:
```bash
ngrok http 3000
# Use the https URL as your Bouncie webhook endpoint
```

### 8. Run the development server

```bash
npm run dev
```

App runs at: [http://localhost:3000](http://localhost:3000)

**Routes:**
- `/` — Public landing page
- `/apply` — Renter application form
- `/login` — Authentication
- `/portal` — Renter dashboard (authenticated)
- `/admin` — Admin dashboard (authenticated, admin role only)

---

## Environment Variables

```env
# ── Supabase ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ── Stripe ────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ── Bouncie ───────────────────────────────────────────────────────────────────
BOUNCIE_API_KEY=your-bouncie-api-key
BOUNCIE_WEBHOOK_SECRET=your-bouncie-webhook-secret

# ── Twilio ────────────────────────────────────────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_NUMBER=+1XXXXXXXXXX
ADMIN_PHONE_NUMBER=+1XXXXXXXXXX

# ── Resend ────────────────────────────────────────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@easydrive.ca
ADMIN_EMAIL=owner@easydrive.ca

# ── PandaDoc ──────────────────────────────────────────────────────────────────
PANDADOC_API_KEY=your-pandadoc-api-key
PANDADOC_TEMPLATE_ID=your-rental-agreement-template-id

# ── App ───────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Security note:** `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security.
> Never expose it to the browser. It is only used in server-side API routes.

---

## Deployment (Vercel)

```bash
npm install -g vercel
vercel --prod
```

Add all environment variables in the Vercel dashboard under Project → Settings → Environment Variables.

**Stripe production webhooks:**
In Stripe dashboard → Webhooks → Add endpoint:
- URL: `https://easydrive.ca/api/webhooks/stripe`
- Events: `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`

---

## Running Tests

```bash
npm test              # unit tests (Vitest)
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

Critical tests covered:
- `src/__tests__/stripe.test.ts` — payment calculation logic
- `src/__tests__/application.test.ts` — eligibility validation rules
- `src/__tests__/sanitize.test.ts` — input sanitisation
- `src/__tests__/webhooks.test.ts` — Bouncie + Stripe webhook processing

---

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Landing, apply form, login — no auth required
│   ├── (renter)/portal/   # Renter dashboard — renter role required
│   ├── (admin)/admin/     # Admin portal — admin role required
│   └── api/               # REST API + webhook handlers
├── components/
│   ├── admin/             # Admin-specific components
│   └── ui/                # Shared design system components
├── lib/
│   ├── supabase/          # Client, server, and middleware helpers
│   ├── stripe.ts          # Stripe SDK + billing helpers
│   ├── bouncie.ts         # GPS API client
│   ├── notifications.ts   # SMS (Twilio) + email (Resend)
│   └── validations/       # Zod schemas + input sanitisation
├── types/
│   └── supabase.ts        # Generated database type definitions
└── __tests__/             # Unit tests (Vitest)
```

---

## Key Business Rules (Implemented in Code)

| Rule | Location |
|---|---|
| Reject applications with suspended licence | `api/applications/route.ts:L71` |
| Reject applications with ≥3 at-fault accidents | `api/applications/route.ts:L76` |
| One active application per renter at a time | `api/applications/route.ts:L57` |
| Vehicle cannot be double-rented | `supabase/migrations/0001_initial_schema.sql` (unique index) |
| Kill switch requires a written reason | `api/rentals/[id]/killswitch/route.ts` |
| Kill switch only works on active rentals | `api/rentals/[id]/killswitch/route.ts:L39` |
| Kill switch activation notifies renter by SMS | `api/rentals/[id]/killswitch/route.ts:L67` |
| All Stripe webhooks verified by HMAC | `api/webhooks/stripe/route.ts:L18` |
| All Bouncie webhooks verified by HMAC | `api/webhooks/bouncie/route.ts:L19` |
| Admin routes protected by role check in middleware | `lib/supabase/middleware.ts` |
| All DB reads scoped by RLS policies | `supabase/migrations/0001_initial_schema.sql` |

---

## Contributing

1. Branch naming: `feat/`, `fix/`, `chore/`
2. Always run `npm run typecheck` before pushing
3. Update this README if setup steps change
4. Never commit `.env.local`
