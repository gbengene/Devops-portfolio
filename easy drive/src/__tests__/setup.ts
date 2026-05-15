/**
 * Global test setup.
 * Loads environment variables and mocks external services
 * so tests don't make real API calls.
 */

// Stub env vars that the app reads at module load time
process.env.NEXT_PUBLIC_SUPABASE_URL   = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY  = 'test-service-role-key'
process.env.STRIPE_SECRET_KEY          = 'sk_test_stub'
process.env.STRIPE_WEBHOOK_SECRET      = 'whsec_test_stub'
process.env.BOUNCIE_API_KEY            = 'bouncie_test_stub'
process.env.BOUNCIE_WEBHOOK_SECRET     = 'bouncie_secret_stub'
process.env.TWILIO_ACCOUNT_SID         = 'ACtest'
process.env.TWILIO_AUTH_TOKEN          = 'test_token'
process.env.TWILIO_FROM_NUMBER         = '+10000000000'
process.env.ADMIN_PHONE_NUMBER         = '+10000000001'
process.env.RESEND_API_KEY             = 're_test'
process.env.RESEND_FROM_EMAIL          = 'test@easydrive.ca'
process.env.ADMIN_EMAIL                = 'admin@easydrive.ca'
process.env.NEXT_PUBLIC_APP_URL        = 'http://localhost:3000'
