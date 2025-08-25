# AI-Powered Mental Health Booking Agent

A comprehensive, intelligent mental health booking system built with Next.js 15, TypeScript, and OpenRouter AI. This system provides natural conversation capabilities, automated booking workflows, and robust conflict resolution for counseling sessions.

## ✨ Features

- **🧠 AI-Powered Conversations**: Natural language understanding for mental health support
- **📅 Smart Booking System**: Conflict-free appointment scheduling with real-time availability
- **🎯 Intent Recognition**: Automatically detects booking requests, mental health queries, and crisis situations
- **📱 Modern UI**: Responsive design with seamless chat-to-booking flow
- **🔒 Secure & Reliable**: Authentication, validation, and comprehensive error handling
- **💬 Context Awareness**: Maintains conversation history and user preferences

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenRouter API key ([Get one here](https://openrouter.ai/))

### Installation

1. **Clone the repository**
```bash
   git clone <your-repo-url>
cd ai-booking-agent
   ```

2. **Install dependencies**
   ```bash
pnpm install
```

3. **Environment setup**
```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/ai_booking"
OPENROUTER_API_KEY="your-openrouter-api-key"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Database setup**
```bash
# Generate Prisma client
   pnpm db:generate

   # Push schema to database
   pnpm db:push

# Seed with sample data
   pnpm db:seed
```

5. **Start development server**
```bash
pnpm dev
```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ System Architecture

### Core Components

- **`BookingAgent`** (`lib/agent.ts`): AI-powered conversation processing and intent analysis
- **Chat Interface** (`components/chat/`): Modern chat UI with AI integration
- **Booking Form** (`components/booking/`): Multi-step appointment scheduling
- **API Routes** (`app/api/`): RESTful endpoints for all system operations
- **Database** (`prisma/`): PostgreSQL with Prisma ORM

### Data Flow

```
User Message → AI Analysis → Intent Detection → Response Generation → UI Update
     ↓
If Booking Intent → Show Form → User Input → Validation → Booking Creation
     ↓
Confirmation → Meeting Setup → Session Scheduled
```

## 💬 How It Works

### 1. Natural Conversation
Users can chat naturally with the AI about their mental health needs:

```
User: "I'm feeling anxious about work lately"
AI: "I understand that work-related anxiety can be really challenging. 
     It's great that you're reaching out for support. I can help you 
     find a counselor who specializes in anxiety and workplace stress. 
     Would you like to book a session?"
```

### 2. Intelligent Intent Recognition
The AI automatically detects:
- **Booking requests**: "I need to book a session"
- **Mental health queries**: "What are signs of depression?"
- **Crisis situations**: "I'm having thoughts of harming myself"
- **General support**: "How can I manage stress?"

### 3. Seamless Booking Flow
When a booking is requested:
1. **Counselor Selection**: Browse by specialty, view profiles
2. **Time Selection**: Choose date/time with real-time availability
3. **Confirmation**: Review details and confirm booking
4. **Session Creation**: Automatic meeting setup and confirmation

### 4. Crisis Intervention
For urgent situations, the AI provides immediate resources:
- Emergency contact numbers
- Crisis hotlines
- Professional help guidance

## 🔧 API Endpoints

### Chat
- `POST /api/chat` - Process user messages with AI
- `GET /api/chat` - Retrieve conversation history

### Counselors
- `GET /api/counselors` - Fetch available counselors
- `GET /api/counselors?specialty=anxiety` - Filter by specialty

### Booking
- `POST /api/booking/availability` - Check time slot availability
- `POST /api/booking/create` - Create new appointment

## 🎨 Customization

### AI Behavior
Modify the AI's personality and responses in `lib/agent.ts`:

```typescript
const MENTAL_HEALTH_CONTEXT = `
You are a compassionate mental health AI assistant that helps users with:
1. Booking counseling sessions
2. Providing general mental health information and support
3. Crisis intervention guidance
4. Self-care tips and coping strategies
5. Understanding different therapy types and approaches
`
```

### UI Components
Customize the interface in `components/`:
- Chat interface styling
- Booking form steps
- Color schemes and branding
- Mobile responsiveness

### Database Schema
Extend the data model in `prisma/schema.prisma`:
- Additional user fields
- Custom counselor attributes
- Extended booking options
- New entity types

## 🧪 Testing

### Run Tests
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm type-check
```

### Test Data
The system includes sample data for testing:
- Sample counselors with specialties
- Availability schedules
- User accounts
- Booking examples

## 📊 Monitoring & Analytics

### Built-in Monitoring
- Conversation analytics
- Booking success rates
- User engagement metrics
- Error tracking and logging

### Health Checks
- Database connectivity
- AI service status
- API endpoint health
- System performance metrics

## 🚀 Deployment

### Production Build
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Environment Variables
Ensure all production environment variables are set:
- Database connection strings
- API keys and secrets
- External service URLs
- Security configurations

### Database Migration
```bash
# Run migrations
pnpm db:migrate

# Verify schema
pnpm db:studio
```

## 🔒 Security Features

- **Authentication**: Secure user login and session management
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive data sanitization
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **Rate Limiting**: API abuse prevention
- **HTTPS**: Secure data transmission

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code formatting
- Write comprehensive tests
- Update documentation for new features
- Follow the existing code structure

## 📚 Documentation

- **API Reference**: Complete endpoint documentation
- **Component Library**: UI component usage and customization
- **Database Schema**: Data model and relationships
- **Deployment Guide**: Production deployment instructions
- **Troubleshooting**: Common issues and solutions

## 🆘 Support

### Getting Help
- **Documentation**: Check the docs folder
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions
- **Email**: Contact the development team

### Common Issues
- **Database Connection**: Verify DATABASE_URL and network access
- **AI Service**: Check OPENROUTER_API_KEY and API limits
- **Build Errors**: Ensure Node.js version compatibility
- **Runtime Errors**: Check environment variable configuration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenRouter** for AI capabilities
- **Next.js** team for the amazing framework
- **Prisma** for database management
- **Tailwind CSS** for styling utilities
- **Mental Health Community** for guidance and feedback

---

**Built with ❤️ for mental health support and accessibility**
