import twilio from 'twilio'
import { Resend } from 'resend'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

const resend = new Resend(process.env.RESEND_API_KEY!)

// ── SMS ───────────────────────────────────────────────────────────────────────

export async function sendSMS(to: string, message: string): Promise<void> {
  await twilioClient.messages.create({
    from: process.env.TWILIO_FROM_NUMBER!,
    to,
    body: message,
  })
}

export async function alertAdmin(message: string): Promise<void> {
  await sendSMS(process.env.ADMIN_PHONE_NUMBER!, `[Easy Drive Alert] ${message}`)
}

// ── EMAIL ─────────────────────────────────────────────────────────────────────

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
}): Promise<void> {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: params.to,
    subject: params.subject,
    html: params.html,
  })
}

// ── Notification templates ────────────────────────────────────────────────────

export const notify = {
  /** Renter: application approved, sign the rental agreement */
  async rentalApproved(params: {
    renterPhone: string
    renterEmail: string
    renterName: string
    signingUrl: string
  }) {
    await sendSMS(
      params.renterPhone,
      `Hi ${params.renterName}, your Easy Drive application is APPROVED! Sign your rental agreement to get started: ${params.signingUrl}`
    )
    await sendEmail({
      to: params.renterEmail,
      subject: 'Easy Drive — You\'re Approved! Sign Your Rental Agreement',
      html: `
        <p>Hi ${params.renterName},</p>
        <p>Great news — your Easy Drive application has been approved!</p>
        <p>Please sign your rental agreement to complete the process:</p>
        <p><a href="${params.signingUrl}" style="background:#007A87;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;">Sign Agreement</a></p>
        <p>Once signed, we will contact you to arrange vehicle pickup.</p>
        <p>— Easy Drive Team</p>
      `,
    })
  },

  /** Renter: application rejected */
  async rentalRejected(params: {
    renterPhone: string
    renterEmail: string
    renterName: string
    reason: string
  }) {
    await sendSMS(
      params.renterPhone,
      `Hi ${params.renterName}, unfortunately your Easy Drive application was not approved at this time. Reason: ${params.reason}. You may re-apply after 30 days.`
    )
  },

  /** Admin: new application received */
  async newApplication(params: { applicantName: string; applicationId: string }) {
    await alertAdmin(
      `New rental application from ${params.applicantName}. Review: ${process.env.NEXT_PUBLIC_APP_URL}/admin/applications/${params.applicationId}`
    )
    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: `Easy Drive — New Application: ${params.applicantName}`,
      html: `<p>New application received from <strong>${params.applicantName}</strong>.</p>
             <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/applications/${params.applicationId}">Review Application</a></p>`,
    })
  },

  /** Admin: geofence breach */
  async geofenceBreach(params: { plate: string; lat: number; lng: number }) {
    await alertAdmin(
      `CRITICAL: Vehicle ${params.plate} has left Ontario boundary. Last location: ${params.lat}, ${params.lng}. Activate kill switch if needed.`
    )
  },

  /** Admin + Renter: payment failed */
  async paymentFailed(params: {
    renterPhone: string
    renterName: string
    plate: string
    rentalId: string
  }) {
    await sendSMS(
      params.renterPhone,
      `Hi ${params.renterName}, your Easy Drive weekly payment failed. Please update your payment method within 24 hours to avoid vehicle disable. Contact us immediately.`
    )
    await alertAdmin(
      `Payment FAILED for renter ${params.renterName}, vehicle ${params.plate}. Rental ID: ${params.rentalId}`
    )
  },

  /** Renter: 24h payment reminder */
  async paymentReminder(params: {
    renterPhone: string
    renterName: string
    amount: number
  }) {
    await sendSMS(
      params.renterPhone,
      `Hi ${params.renterName}, reminder: your Easy Drive weekly rental payment of $${params.amount} CAD is due tomorrow. No action needed if you have a card on file.`
    )
  },

  /** Admin: agreement signed, vehicle ready to hand over */
  async agreementSigned(params: { renterName: string; plate: string }) {
    await alertAdmin(
      `${params.renterName} has signed the rental agreement for vehicle ${params.plate}. Ready for handoff.`
    )
  },
}
