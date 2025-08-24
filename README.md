# AI Booking Agent 🤖📅

A sophisticated, AI-powered counseling session booking system built with Next.js, featuring intelligent conversation-based scheduling, role-based authentication, and robust meeting room management.

## ✨ Features

### 🧠 AI-Powered Booking
- **Intelligent Conversation Interface** - Natural language booking through AI chat
- **Smart Counselor Matching** - AI suggests counselors based on user concerns
- **Conflict Detection** - Prevents double-booking and time overlaps
- **Dynamic Availability** - Real-time time slot management

### 🔐 Role-Based Authentication
- **Multi-Role System** - USER, COUNSELOR, and ADMIN roles
- **Secure Access Control** - Role-appropriate dashboards and features
- **Magic Link Authentication** - Passwordless login system
- **Protected Routes** - Middleware-based security

### 🏢 Meeting Room Management
- **Pool of Video Conference Links** - Efficient room assignment
- **Automatic Conflict Prevention** - No simultaneous room usage
- **Fallback System** - Generates new links when needed
- **Real-time Status Monitoring** - Admin dashboard for room usage

### 📧 Professional Communication
- **Beautiful Email Templates** - React Email integration
- **Automatic Confirmations** - Instant booking confirmations
- **Meeting Details** - Complete session information
- **Resend Integration** - Reliable email delivery

### 📱 Modern User Experience
- **Responsive Design** - Mobile-first approach
- **Beautiful UI Components** - Radix UI + Tailwind CSS
- **Real-time Updates** - Dynamic content without page refresh
- **Accessibility** - WCAG compliant components

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   External      │              │
         │              │   Services      │              │
         │              └─────────────────┘              │
         │              │ • OpenRouter AI │              │
         │              │ • Resend Email  │              │
         │              │ • JWT Auth      │              │
         └──────────────┴─────────────────┴──────────────┘
```

### **Technology Stack**
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based magic link system
- **AI**: OpenRouter API integration
- **Email**: Resend with React Email templates
- **Package Manager**: pnpm

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- pnpm package manager
- Resend account (for emails)
- OpenRouter API key (for AI)

### 1. Clone & Install
```bash
git clone <repository-url>
cd ai-booking-agent
pnpm install
```

### 2. Environment Setup
Create `.env.local`:
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

### 3. Database Setup
```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Seed with sample data
pnpm prisma db seed
```

### 4. Start Development
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 📚 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run database migrations
pnpm db:studio    # Open Prisma Studio
pnpm db:seed      # Seed database with sample data
```

## 🎯 User Roles & Access

### **USER** (Default Role)
- **Access**: Dashboard, Booking, Profile
- **Features**: Book sessions, view history, manage preferences
- **Pages**: `/dashboard`, `/booking`, `/profile`

### **COUNSELOR**
- **Access**: Counselor Dashboard, Sessions, Clients, Profile
- **Features**: View scheduled sessions, manage availability
- **Pages**: `/counselor`, `/profile`

### **ADMIN**
- **Access**: Admin Dashboard, Meeting Links, Users, Counselors
- **Features**: System monitoring, user management, room status
- **Pages**: `/dashboard`, `/admin/*`, `/profile`

## 🔧 Configuration

### Meeting Room Links
Default video conference links in `lib/meeting-links.ts`:
```typescript
const MEETING_LINKS = [
  "https://meet.google.com/edk-quho-xck",
  "https://meet.google.com/ycw-qhgp-aiy",
  // ... more links
]
```

### Counselor Availability
Set working hours in the database:
```sql
INSERT INTO counselor_availability (counselor_id, day_of_week, start_time, end_time) VALUES
('counselor_1', 1, '09:00', '17:00'), -- Monday 9 AM - 5 PM
('counselor_1', 2, '09:00', '17:00'), -- Tuesday 9 AM - 5 PM
```

## 📱 Usage Guide

### For End Users
1. **Navigate to `/booking`**
2. **Chat with AI** about your counseling needs
3. **AI suggests counselors** based on your concerns
4. **Choose time slots** from available options
5. **Receive confirmation** with meeting details and email

### For Counselors
1. **Login with counselor account**
2. **View scheduled sessions** on dashboard
3. **Manage availability** and specialties
4. **Access client information** and session details

### For Administrators
1. **Monitor system status** on admin dashboard
2. **Manage meeting rooms** and usage statistics
3. **Oversee users and counselors**
4. **Track booking metrics** and system health

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/send-magic-link` - Send login link
- `GET /api/auth/verify` - Verify login token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout user

### Booking System
- `POST /api/chat` - AI conversation and booking creation
- `GET /api/preferences` - Get user preferences
- `POST /api/preferences` - Update user preferences

### Admin System
- `GET /api/admin/meeting-links/status` - Meeting room status
- `GET /api/admin/users` - User management (coming soon)
- `GET /api/admin/counselors` - Counselor management (coming soon)

### Profile Management
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Update user profile

## 🧪 Testing

### Test the Booking Flow
1. Start the app: `pnpm dev`
2. Go to `/booking`
3. Ask AI: "I need help with anxiety"
4. Follow the conversation to book a session
5. Check email for confirmation

### Test Role-Based Access
1. Login with different role accounts
2. Verify appropriate navigation items appear
3. Test protected route access
4. Check role-based redirects

### Test Admin Features
1. Login as admin user
2. Navigate to `/admin/meeting-links`
3. Verify room status display
4. Check system statistics

## 🚨 Troubleshooting

### Common Issues

**Database Connection Failed**
- Check `DATABASE_URL` in `.env.local`
- Ensure PostgreSQL is running
- Run `pnpm prisma generate` and `pnpm prisma migrate dev`

**Email Not Sending**
- Verify `RESEND_API_KEY` is correct
- Check Resend account status
- Review server logs for error details

**AI Not Responding**
- Confirm `OPENROUTER_API_KEY` is valid
- Check API quota and limits
- Verify network connectivity

**Authentication Issues**
- Check JWT secret configuration
- Verify magic link setup
- Review middleware configuration

### Debug Mode
- Check browser console for client errors
- Review server logs for API errors
- Use browser dev tools to inspect network requests
- Monitor database with Prisma Studio: `pnpm prisma studio`

## 🚀 Production Deployment

### Environment Setup
1. **Update URLs** to production domains
2. **Use strong JWT secrets**
3. **Configure production database**
4. **Set secure cookie flags**

### Security Considerations
- Enable HTTPS
- Implement rate limiting
- Add admin role checks
- Set secure environment variables

### Monitoring
- Set up logging and error tracking
- Monitor meeting room utilization
- Track booking success rates
- Monitor email delivery

## 📊 Performance Optimization

- **Database Indexing** - Optimize queries for large datasets
- **Caching** - Implement Redis for frequently accessed data
- **Connection Pooling** - Configure Prisma connection limits
- **Background Jobs** - Queue email sending for better performance

## 🔮 Future Enhancements

- **Calendar Integration** - Sync with external calendar systems
- **Video Recording** - Store session recordings (with consent)
- **Payment Processing** - Integrate billing and payment systems
- **Multi-language Support** - Internationalization for global users
- **Mobile App** - Native mobile applications
- **Analytics Dashboard** - Advanced reporting and insights
- **Role Management Interface** - Admin UI for role assignment
- **Permission System** - Fine-grained access control

## 📁 Project Structure

```
ai-booking-agent/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin pages and routes
│   ├── api/               # API endpoints
│   ├── auth/              # Authentication pages
│   ├── booking/           # Booking interface
│   ├── counselor/         # Counselor dashboard
│   ├── dashboard/         # User dashboard
│   └── profile/           # Profile management
├── components/             # React components
│   ├── admin/             # Admin-specific components
│   ├── auth/              # Authentication components
│   ├── booking/           # Booking components
│   ├── chat/              # Chat interface components
│   ├── dashboard/         # Dashboard components
│   ├── profile/           # Profile components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   ├── auth.ts            # Authentication utilities
│   ├── booking-tools.ts   # Booking logic
│   ├── email-service.ts   # Email functionality
│   ├── meeting-links.ts   # Meeting room management
│   ├── openrouter.ts      # AI API integration
│   └── prisma.ts          # Database client
├── prisma/                # Database schema and migrations
├── emails/                # Email templates
└── hooks/                 # Custom React hooks
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For technical support or questions:
- Check the troubleshooting section above
- Review server logs for error details
- Open an issue in the repository
- Contact the development team

---

**Built with ❤️ using Next.js, React, and modern web technologies**

*The AI Booking Agent provides a robust, scalable solution for managing counseling session bookings with intelligent AI assistance and comprehensive role-based access control.*
