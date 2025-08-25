import { Resend } from 'resend'
import { render } from '@react-email/render'
import { BookingConfirmationEmail } from '../emails/booking-confirmation'

const resend = new Resend(process.env.RESEND_API_KEY)
const DEFAULT_FROM = process.env.RESEND_FROM || 'AI Booking Agent <onboarding@resend.dev>'

interface SendBookingConfirmationParams {
  userEmail: string
  userName: string
  counselorName: string
  appointmentDate: string
  appointmentTime: string
  meetingLink?: string
  notes?: string
}

export class EmailService {
  /**
   * Send booking confirmation email
   */
  static async sendBookingConfirmation(params: SendBookingConfirmationParams) {
    try {
      const { userEmail, userName, counselorName, appointmentDate, appointmentTime, meetingLink, notes } = params

      // Render the React email component to HTML
      const emailHtml = render(
        BookingConfirmationEmail({
          userName,
          counselorName,
          appointmentDate,
          appointmentTime,
          meetingLink,
          notes,
        })
      )

      const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM,
        to: [userEmail],
        subject: `Booking Confirmed: Session with ${counselorName}`,
        html: emailHtml,
        text: this.generatePlainText(params), // Fallback plain text
      })

      if (error) {
        console.error('Failed to send email:', error)
        throw new Error(`Email sending failed: ${error.message}`)
      }

      console.log('Booking confirmation email sent successfully:', data)
      return data
    } catch (error) {
      console.error('Email service error:', error)
      throw error
    }
  }

  /**
   * Generate plain text fallback for email clients that don't support HTML
   */
  private static generatePlainText(params: SendBookingConfirmationParams): string {
    const { userName, counselorName, appointmentDate, appointmentTime, meetingLink, notes } = params
    
    let text = `Hi ${userName},\n\n`
    text += `Great news! Your counseling session has been confirmed.\n\n`
    text += `Details:\n`
    text += `- Counselor: ${counselorName}\n`
    text += `- Date: ${appointmentDate}\n`
    text += `- Time: ${appointmentTime} (1 hour session)\n\n`
    
    if (meetingLink) {
      text += `Video Conference:\n`
      text += `Join your session via video conference: ${meetingLink}\n\n`
    }
    
    if (notes) {
      text += `Session Notes: ${notes}\n\n`
    }
    
    text += `Important Information:\n`
    text += `• Please join the meeting 5 minutes early\n`
    text += `• Ensure you have a stable internet connection\n`
    text += `• Test your camera and microphone beforehand\n\n`
    
    text += `Need to reschedule or cancel? Contact us at support@franc-dev.space\n\n`
    text += `© 2024 AI Booking Agent. All rights reserved.`
    
    return text
  }

  /**
   * Send session reminder email (30 minutes before)
   */
  static async sendSessionReminder(
    userEmail: string,
    userName: string,
    counselorName: string,
    appointmentTime: string,
    meetingLink: string
  ) {
    try {
      const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM,
        to: [userEmail],
        subject: `Reminder: Your session with ${counselorName} starts in 30 minutes`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Session Reminder</h2>
            <p>Hi ${userName},</p>
            <p>Your counseling session with <strong>${counselorName}</strong> starts in 30 minutes.</p>
            <p><strong>Time:</strong> ${appointmentTime}</p>
            <p><strong>Duration:</strong> 1 hour</p>
            <br>
            <p><a href="${meetingLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">🎥 Join Meeting</a></p>
            <br>
            <p>Please ensure you have a stable internet connection and test your camera/microphone.</p>
            <p>See you soon!</p>
          </div>
        `,
      })

      if (error) {
        console.error('Failed to send reminder email:', error)
        throw new Error(`Reminder email sending failed: ${error.message}`)
      }

      console.log('Session reminder email sent successfully:', data)
      return data
    } catch (error) {
      console.error('Reminder email service error:', error)
      throw error
    }
  }

  /**
   * Send cancellation confirmation email
   */
  static async sendCancellationEmail(
    userEmail: string,
    userName: string,
    counselorName: string,
    appointmentDate: string,
    appointmentTime: string
  ) {
    try {
      const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM,
        to: [userEmail],
        subject: `Session Cancelled: ${counselorName} on ${appointmentDate}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Session Cancelled</h2>
            <p>Hi ${userName},</p>
            <p>Your counseling session has been cancelled:</p>
            <p><strong>Counselor:</strong> ${counselorName}</p>
            <p><strong>Date:</strong> ${appointmentDate}</p>
            <p><strong>Time:</strong> ${appointmentTime}</p>
            <br>
            <p>To reschedule, please visit your dashboard or contact us at support@franc-dev.space</p>
            <p>We hope to see you soon!</p>
          </div>
        `,
      })

      if (error) {
        console.error('Failed to send cancellation email:', error)
        throw new Error(`Cancellation email sending failed: ${error.message}`)
      }

      console.log('Cancellation email sent successfully:', data)
      return data
    } catch (error) {
      console.error('Cancellation email service error:', error)
      throw error
    }
  }

  /**
   * Notify counselor of a new booking
   */
  static async sendCounselorNotification(params: {
    counselorEmail: string
    counselorName: string
    userName: string
    appointmentDate: string
    appointmentTime: string
    meetingLink?: string
    notes?: string
  }) {
    try {
      const { counselorEmail, counselorName, userName, appointmentDate, appointmentTime, meetingLink, notes } = params
      const { data, error } = await resend.emails.send({
        from: DEFAULT_FROM,
        to: [counselorEmail],
        subject: `New Session Booked: ${userName} on ${appointmentDate}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Booking</h2>
            <p>Hello ${counselorName},</p>
            <p>A new counseling session has been booked.</p>
            <ul>
              <li><strong>Client:</strong> ${userName}</li>
              <li><strong>Date:</strong> ${appointmentDate}</li>
              <li><strong>Time:</strong> ${appointmentTime}</li>
              ${meetingLink ? `<li><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></li>` : ''}
              ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
            </ul>
            <p>Please be ready a few minutes before the session.</p>
          </div>
        `,
        text: `New booking with ${userName} on ${appointmentDate} at ${appointmentTime}.${meetingLink ? ` Meeting: ${meetingLink}.` : ''}${notes ? ` Notes: ${notes}` : ''}`
      })

      if (error) {
        console.error('Failed to send counselor notification:', error)
        throw new Error(`Counselor notification failed: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Counselor notification error:', error)
      throw error
    }
  }
}
