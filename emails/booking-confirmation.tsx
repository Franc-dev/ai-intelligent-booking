import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface BookingConfirmationEmailProps {
  userName: string;
  counselorName: string;
  appointmentDate: string;
  appointmentTime: string;
  meetingLink?: string;
  notes?: string;
}

export const BookingConfirmationEmail = ({
  userName,
  counselorName,
  appointmentDate,
  appointmentTime,
  meetingLink,
  notes,
}: BookingConfirmationEmailProps) => {
  const previewText = `Your counseling session with ${counselorName} has been confirmed for ${appointmentDate} at ${appointmentTime}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://via.placeholder.com/120x40/6366f1/ffffff?text=AI+Booking"
              width="120"
              height="40"
              alt="AI Booking Agent"
              style={logo}
            />
            <Heading style={h1}>Booking Confirmed! 🎉</Heading>
            <Text style={subtitle}>
              Your counseling session has been successfully scheduled
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={mainContent}>
            <Text style={greeting}>Hi {userName},</Text>
            
            <Text style={paragraph}>
              Great news! Your counseling session has been confirmed. Here are all the details you need:
            </Text>

            {/* Appointment Details Card */}
            <Section style={card}>
              <Row>
                <Column style={iconColumn}>
                  <Text style={icon}>👨‍⚕️</Text>
                </Column>
                <Column style={detailsColumn}>
                  <Text style={label}>Counselor</Text>
                  <Text style={value}>{counselorName}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column style={iconColumn}>
                  <Text style={icon}>📅</Text>
                </Column>
                <Column style={detailsColumn}>
                  <Text style={label}>Date</Text>
                  <Text style={value}>{appointmentDate}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column style={iconColumn}>
                  <Text style={icon}>🕐</Text>
                </Column>
                <Column style={detailsColumn}>
                  <Text style={label}>Time</Text>
                  <Text style={value}>{appointmentTime} (1 hour session)</Text>
                </Column>
              </Row>
            </Section>

            {/* Meeting Link Section */}
            {meetingLink ? (
              <Section style={meetingSection}>
                <Heading style={h2}>Video Conference</Heading>
                <Text style={meetingText}>
                  Your session will be held via Google Meet. Click the button below to join:
                </Text>
                <Button style={button} href={meetingLink}>
                  🎥 Join Meeting
                </Button>
                <Text style={meetingNote}>
                  Or copy this link: <Link href={meetingLink} style={link}>{meetingLink}</Link>
                </Text>
              </Section>
            ) : (
              <Section style={meetingSection}>
                <Heading style={h2}>Meeting Details</Heading>
                <Text style={meetingText}>
                  Your counselor will provide meeting details separately. Please check your email or contact them directly.
                </Text>
              </Section>
            )}

            {/* Notes Section */}
            {notes && (
              <Section style={notesSection}>
                <Heading style={h3}>Session Notes</Heading>
                <Text style={notesText}>{notes}</Text>
              </Section>
            )}

            {/* Important Information */}
            <Section style={infoSection}>
              <Heading style={h3}>Important Information</Heading>
              <Text style={infoText}>
                • Please join the meeting 5 minutes early<br/>
                • Ensure you have a stable internet connection<br/>
                • Test your camera and microphone beforehand<br/>
                {meetingLink && "• You'll receive a reminder 30 minutes before the session"}
              </Text>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Need to reschedule or cancel? Contact us at{' '}
              <Link href="mailto:support@aibooking.com" style={link}>
                support@aibooking.com
              </Link>
            </Text>
            <Text style={footerText}>
              © 2024 AI Booking Agent. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  textAlign: 'center' as const,
  padding: '48px 0',
  backgroundColor: '#6366f1',
  color: '#ffffff',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const subtitle = {
  color: '#ffffff',
  fontSize: '16px',
  margin: '0',
  opacity: 0.8,
};

const mainContent = {
  padding: '48px 24px',
};

const greeting = {
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '24px',
  color: '#1f2937',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '24px',
  color: '#374151',
};

const card = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '32px',
  border: '1px solid #e5e7eb',
};

const iconColumn = {
  width: '48px',
  verticalAlign: 'top' as const,
};

const detailsColumn = {
  verticalAlign: 'top' as const,
};

const icon = {
  fontSize: '24px',
  margin: '0',
};

const label = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#6b7280',
  margin: '0 0 4px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};

const value = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0',
};

const meetingSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const h2 = {
  fontSize: '20px',
  fontWeight: 'bold',
  marginBottom: '16px',
  color: '#1f2937',
};

const meetingText = {
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '24px',
  color: '#374151',
};

const button = {
  backgroundColor: '#10b981',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  marginBottom: '16px',
};

const meetingNote = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const link = {
  color: '#6366f1',
  textDecoration: 'underline',
};

const notesSection = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '32px',
  border: '1px solid #f59e0b',
};

const h3 = {
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '12px',
  color: '#92400e',
};

const notesText = {
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  color: '#92400e',
};

const infoSection = {
  backgroundColor: '#dbeafe',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '32px',
  border: '1px solid #3b82f6',
};

const infoText = {
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  color: '#1e40af',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '48px 0',
};

const footer = {
  textAlign: 'center' as const,
  padding: '0 24px',
};

const footerText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '8px 0',
};

export default BookingConfirmationEmail;

