import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingEmailData {
  to: string
  userName: string
  counselorName: string
  scheduledAt: Date
  meetingLink: string
  bookingId: string
  isCounselor?: boolean
  clientName?: string
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  try {
    const { to, userName, counselorName, scheduledAt, meetingLink, bookingId, isCounselor, clientName } = data
    
    const subject = isCounselor 
      ? `New Session Booked - ${clientName} on ${scheduledAt.toLocaleDateString()}`
      : `Session Confirmed - ${counselorName} on ${scheduledAt.toLocaleDateString()}`

    const htmlContent = isCounselor ?`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Session Booked</h2>
        <p>Hello ${userName},</p>
        <p>A new client has booked a session with you:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Session Details</h3>
          <p><strong>Client:</strong> ${clientName}</p>
          <p><strong>Date:</strong> ${scheduledAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>Time:</strong> ${scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
          <p><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #2563eb;">${meetingLink}</a></p>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
        </div>
        
        <p>Please prepare for this session and join the meeting link at the scheduled time.</p>
        
        <p>Best regards,<br>AI Booking System</p>
      </div>
    ` : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Session Confirmed!</h2>
        <p>Hello ${userName},</p>
        <p>Your counseling session has been successfully booked!</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Appointment Details</h3>
          <p><strong>Counselor:</strong> ${counselorName}</p>
          <p><strong>Date:</strong> ${scheduledAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>Time:</strong> ${scheduledAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
          <p><strong>Meeting Link:</strong> <a href="${meetingLink}" style="color: #2563eb;">${meetingLink}</a></p>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
        </div>
        
        <h3>Preparing for Your Session</h3>
        <ul>
          <li>Test your video and audio before the session</li>
          <li>Find a quiet, private space</li>
          <li>Join the meeting 5 minutes early</li>
          <li>Have any relevant documents ready</li>
        </ul>
        
        <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
        
        <p>We look forward to seeing you!</p>
        <p>Best regards,<br>AI Booking System</p>
      </div>
    `

    await resend.emails.send({
      from: 'AI Booking System <noreply@franc-dev.space>',
      to: [to],
      subject,
      html: htmlContent,
    })

    console.log(`Booking confirmation email sent to ${to}`)
  } catch (error) {
    console.error('Failed to send booking email:', error)
  }
}
