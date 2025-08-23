# AI Booking Agent - Robust Meeting Scheduling System

This guide explains how to set up and run the AI Booking Agent with its new robust meeting scheduling system.

## 🚀 Features

- **AI-Powered Booking**: Intelligent conversation-based scheduling
- **Robust Conflict Detection**: Prevents double-booking and time overlaps
- **Automatic Meeting Room Assignment**: Uses your video conference links efficiently
- **Beautiful Email Notifications**: Resend integration with React Email templates
- **Real-time Availability**: Dynamic time slot management
- **Admin Dashboard**: Monitor meeting room usage and system status

## 📋 Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Resend account for email sending
- OpenRouter API key for AI conversations

## 🛠️ Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd ai-booking-agent
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file:
   ```bash
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/ai_booking_agent"
   
   # JWT Secret
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   
   # OpenRouter AI API
   OPENROUTER_API_KEY="your-openrouter-api-key"
   
   # Resend Email Service
   RESEND_API_KEY="your-resend-api-key"
   
   # App URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Set up database:**
   ```bash
   # Generate Prisma client
   pnpm prisma generate
   
   # Run migrations
   pnpm prisma migrate dev
   
   # Seed initial data
   pnpm prisma db seed
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```

## 🏗️ System Architecture

### **Meeting Room Management**
- **Pool of Video Conference Links**: Uses your provided meeting links efficiently
- **Conflict Prevention**: Ensures no two sessions use the same room simultaneously
- **Automatic Assignment**: AI assigns available rooms based on time slots
- **Fallback System**: Generates new links if all rooms are occupied

### **Conflict Detection**
- **Time Overlap Prevention**: Checks for scheduling conflicts
- **Counselor Availability**: Respects counselor working hours
- **User Preferences**: Prioritizes preferred time slots
- **Real-time Validation**: Prevents double-booking

### **Email System**
- **Beautiful Templates**: React Email components for professional appearance
- **Automatic Confirmations**: Sent immediately after booking
- **Meeting Details**: Includes all session information and links
- **Fallback Support**: Plain text versions for email clients

## 🔧 Configuration

### **Meeting Room Links**
The system uses these video conference links by default:
```typescript
const MEETING_LINKS = [
  "https://meet.google.com/edk-quho-xck",
  "https://meet.google.com/ycw-qhgp-aiy",
  "https://meet.google.com/mpu-fcgb-uah",
  "https://meet.google.com/hez-xesx-khq",
  "https://meet.google.com/obk-uwdr-mqt",
  "https://meet.google.com/sqe-ikdj-shj",
  "https://meet.google.com/pmf-aurw-zcf",
  "https://meet.google.com/sum-caqe-bct",
]
```

### **Counselor Availability**
Set counselor working hours in the database:
```sql
INSERT INTO counselor_availability (counselor_id, day_of_week, start_time, end_time) VALUES
('counselor_1', 1, '09:00', '17:00'), -- Monday 9 AM - 5 PM
('counselor_1', 2, '09:00', '17:00'), -- Tuesday 9 AM - 5 PM
-- ... etc
```

## 📱 Usage

### **For Users**
1. **Navigate to `/booking`**
2. **Chat with AI** about your counseling needs
3. **AI suggests counselors** based on your concerns
4. **Choose time slots** from available options
5. **Receive confirmation** with meeting details and email

### **For Admins**
1. **Navigate to `/admin/meeting-links`**
2. **Monitor room usage** and availability
3. **View statistics** and system status
4. **Track current sessions** and upcoming bookings

## 🔍 API Endpoints

### **Booking System**
- `POST /api/chat` - AI conversation and booking creation
- `GET /api/counselors` - List available counselors
- `GET /api/availability/:counselorId` - Check counselor availability

### **Admin System**
- `GET /api/admin/meeting-links/status` - Meeting room status and statistics

### **User Management**
- `POST /api/auth/send-magic-link` - Send login link
- `GET /api/auth/verify` - Verify login token
- `POST /api/preferences` - Update user preferences

## 🧪 Testing

### **Test the Booking Flow**
1. Start the app: `pnpm dev`
2. Go to `/booking`
3. Ask AI: "I need help with anxiety"
4. Follow the conversation to book a session
5. Check email for confirmation

### **Test Conflict Detection**
1. Try to book the same time slot twice
2. Verify the system prevents conflicts
3. Check that different meeting rooms are assigned

### **Test Admin Dashboard**
1. Go to `/admin/meeting-links`
2. Verify room status is displayed
3. Check statistics are accurate

## 🚨 Troubleshooting

### **Common Issues**

1. **Database Connection Failed**
   - Check `DATABASE_URL` in `.env.local`
   - Ensure PostgreSQL is running
   - Run `pnpm prisma generate` and `pnpm prisma migrate dev`

2. **Email Not Sending**
   - Verify `RESEND_API_KEY` is correct
   - Check Resend account status
   - Review server logs for error details

3. **AI Not Responding**
   - Confirm `OPENROUTER_API_KEY` is valid
   - Check API quota and limits
   - Verify network connectivity

4. **Meeting Links Not Working**
   - Ensure video conference links are accessible
   - Check meeting room assignment logic
   - Review conflict detection algorithms

### **Debug Mode**
- Check browser console for client errors
- Review server logs for API errors
- Use browser dev tools to inspect network requests
- Monitor database queries with Prisma Studio: `pnpm prisma studio`

## 🚀 Production Deployment

1. **Environment Variables**
   - Update all URLs to production domains
   - Use strong JWT secrets
   - Configure production database

2. **Security**
   - Enable HTTPS
   - Set secure cookie flags
   - Implement rate limiting
   - Add admin role checks

3. **Monitoring**
   - Set up logging and error tracking
   - Monitor meeting room utilization
   - Track booking success rates
   - Monitor email delivery

## 📊 Performance Optimization

- **Database Indexing**: Optimize queries for large datasets
- **Caching**: Implement Redis for frequently accessed data
- **Connection Pooling**: Configure Prisma connection limits
- **Background Jobs**: Queue email sending for better performance

## 🔮 Future Enhancements

- **Calendar Integration**: Sync with external calendar systems
- **Video Recording**: Store session recordings (with consent)
- **Payment Processing**: Integrate billing and payment systems
- **Multi-language Support**: Internationalization for global users
- **Mobile App**: Native mobile applications
- **Analytics Dashboard**: Advanced reporting and insights

## 📞 Support

For technical support or questions:
- Check the troubleshooting section above
- Review server logs for error details
- Contact the development team
- Open an issue in the repository

---

**The AI Booking Agent is now a robust, production-ready system that efficiently manages meeting scheduling without external API dependencies.**
