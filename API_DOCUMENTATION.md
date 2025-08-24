# API Documentation 📚

This document provides comprehensive information about all API endpoints in the AI Booking Agent system.

## 🔐 Authentication

All protected endpoints require a valid JWT token in the request headers or cookies.

### Headers
```
Authorization: Bearer <jwt_token>
```

### Cookies
```
auth-token: <jwt_token>
```

## 📧 Authentication Endpoints

### Send Magic Link
**POST** `/api/auth/send-magic-link`

Send a magic link to the user's email for passwordless authentication.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Magic link sent to user@example.com"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid email address"
}
```

### Verify Magic Link
**GET** `/api/auth/verify`

Verify the magic link token and authenticate the user.

**Query Parameters:**
- `token` - JWT token from magic link

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### Get Current User
**GET** `/api/auth/me`

Get information about the currently authenticated user.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "preferences": {
      "timezone": "UTC",
      "notificationPreferences": "email"
    }
  }
}
```

### Logout
**POST** `/api/auth/logout`

Logout the current user and invalidate their session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 💬 Chat & Booking Endpoints

### AI Chat Interface
**POST** `/api/chat`

Main endpoint for AI-powered conversation and booking creation.

**Request Body:**
```json
{
  "message": "I need help with anxiety",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hello, I need counseling"
    },
    {
      "role": "assistant",
      "content": "I'd be happy to help you book a counseling session. What type of support are you looking for?"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "I understand you're dealing with anxiety. I can help you find a counselor who specializes in anxiety management. Let me suggest a few options...",
  "suggestedActions": [
    {
      "type": "counselor_selection",
      "counselors": [
        {
          "id": "counselor_1",
          "name": "Dr. Sarah Johnson",
          "specialties": ["Anxiety", "Depression", "Stress Management"],
          "rating": 4.8
        }
      ]
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to process request",
  "details": "AI service temporarily unavailable"
}
```

## 👤 Profile Management

### Get User Profile
**GET** `/api/profile`

Retrieve the current user's profile information.

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "preferences": {
      "timezone": "UTC",
      "notificationPreferences": "email",
      "counselingPreferences": {
        "specialties": ["Anxiety", "Depression"],
        "preferredTimes": ["morning", "afternoon"],
        "sessionLength": 60
      }
    }
  }
}
```

### Update User Profile
**POST** `/api/profile`

Update the current user's profile information.

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+1234567890",
  "preferences": {
    "timezone": "America/New_York",
    "notificationPreferences": "sms",
    "counselingPreferences": {
      "specialties": ["Anxiety", "Depression", "Stress"],
      "preferredTimes": ["morning"],
      "sessionLength": 90
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Smith",
    "phone": "+1234567890",
    "preferences": {
      "timezone": "America/New_York",
      "notificationPreferences": "sms",
      "counselingPreferences": {
        "specialties": ["Anxiety", "Depression", "Stress"],
        "preferredTimes": ["morning"],
        "sessionLength": 90
      }
    }
  }
}
```

## 🎯 User Preferences

### Get User Preferences
**GET** `/api/preferences`

Retrieve the current user's preferences.

**Response:**
```json
{
  "success": true,
  "preferences": {
    "timezone": "UTC",
    "notificationPreferences": "email",
    "counselingPreferences": {
      "specialties": ["Anxiety", "Depression"],
      "preferredTimes": ["morning", "afternoon"],
      "sessionLength": 60
    }
  }
}
```

### Update User Preferences
**POST** `/api/preferences`

Update the current user's preferences.

**Request Body:**
```json
{
  "timezone": "America/New_York",
  "notificationPreferences": "sms",
  "counselingPreferences": {
    "specialties": ["Anxiety", "Depression", "Stress"],
    "preferredTimes": ["morning"],
    "sessionLength": 90
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "preferences": {
    "timezone": "America/New_York",
    "notificationPreferences": "sms",
    "counselingPreferences": {
      "specialties": ["Anxiety", "Depression", "Stress"],
      "preferredTimes": ["morning"],
      "sessionLength": 90
    }
  }
}
```

## 🏢 Admin Endpoints

### Meeting Links Status
**GET** `/api/admin/meeting-links/status`

Get the current status of all meeting rooms and their usage statistics.

**Response:**
```json
{
  "success": true,
  "meetingLinks": [
    {
      "id": "link_1",
      "url": "https://meet.google.com/edk-quho-xck",
      "status": "available",
      "currentSession": null,
      "nextSession": {
        "id": "session_123",
        "startTime": "2024-01-15T10:00:00Z",
        "endTime": "2024-01-15T11:00:00Z",
        "user": "John Doe",
        "counselor": "Dr. Sarah Johnson"
      }
    },
    {
      "id": "link_2",
      "url": "https://meet.google.com/ycw-qhgp-aiy",
      "status": "occupied",
      "currentSession": {
        "id": "session_124",
        "startTime": "2024-01-15T09:00:00Z",
        "endTime": "2024-01-15T10:00:00Z",
        "user": "Jane Smith",
        "counselor": "Dr. Michael Chen"
      },
      "nextSession": null
    }
  ],
  "statistics": {
    "totalRooms": 8,
    "availableRooms": 6,
    "occupiedRooms": 2,
    "utilizationRate": 25.0,
    "totalSessionsToday": 15,
    "upcomingSessions": 8
  }
}
```

### Users Management (Coming Soon)
**GET** `/api/admin/users`

Get a list of all users in the system.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `role` - Filter by user role
- `search` - Search by name or email

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-01-15T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Counselors Management (Coming Soon)
**GET** `/api/admin/counselors`

Get a list of all counselors in the system.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `specialty` - Filter by specialty
- `search` - Search by name or email

**Response:**
```json
{
  "success": true,
  "counselors": [
    {
      "id": "counselor_1",
      "email": "sarah.johnson@example.com",
      "name": "Dr. Sarah Johnson",
      "specialties": ["Anxiety", "Depression", "Stress Management"],
      "rating": 4.8,
      "totalSessions": 150,
      "availability": {
        "monday": ["09:00", "17:00"],
        "tuesday": ["09:00", "17:00"],
        "wednesday": ["09:00", "17:00"],
        "thursday": ["09:00", "17:00"],
        "friday": ["09:00", "17:00"]
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "pages": 2
  }
}
```

## 📊 Data Models

### User Object
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'COUNSELOR' | 'ADMIN';
  phone?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}
```

### User Preferences
```typescript
interface UserPreferences {
  timezone: string;
  notificationPreferences: 'email' | 'sms' | 'both';
  counselingPreferences: {
    specialties: string[];
    preferredTimes: string[];
    sessionLength: number;
  };
}
```

### Counselor Object
```typescript
interface Counselor {
  id: string;
  email: string;
  name: string;
  specialties: string[];
  rating: number;
  totalSessions: number;
  availability: {
    [day: string]: [string, string]; // [startTime, endTime]
  };
  bio?: string;
  credentials?: string[];
}
```

### Session Object
```typescript
interface Session {
  id: string;
  userId: string;
  counselorId: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  meetingLink: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Meeting Link Object
```typescript
interface MeetingLink {
  id: string;
  url: string;
  status: 'available' | 'occupied' | 'maintenance';
  currentSession?: Session;
  nextSession?: Session;
}
```

## 🚨 Error Handling

All API endpoints return consistent error responses:

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `AUTH_REQUIRED` - Authentication required
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `VALIDATION_ERROR` - Request validation failed
- `NOT_FOUND` - Resource not found
- `INTERNAL_ERROR` - Server internal error
- `RATE_LIMITED` - Too many requests

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🔒 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **Chat endpoints**: 10 requests per minute per user
- **Admin endpoints**: 20 requests per minute per admin user
- **Other endpoints**: 30 requests per minute per user

## 📝 Request Examples

### cURL Examples

**Send Magic Link:**
```bash
curl -X POST http://localhost:3000/api/auth/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Get User Profile (Authenticated):**
```bash
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer <jwt_token>"
```

**Update Preferences:**
```bash
curl -X POST http://localhost:3000/api/preferences \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"timezone": "America/New_York"}'
```

### JavaScript Examples

**Send Magic Link:**
```javascript
const response = await fetch('/api/auth/send-magic-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});

const data = await response.json();
```

**Get Profile (Authenticated):**
```javascript
const response = await fetch('/api/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
```

## 🔍 Testing

### Test Environment
- **Base URL**: `http://localhost:3000` (development)
- **Test Database**: Separate test database recommended
- **Mock Services**: AI and email services can be mocked for testing

### Test Data
Use the provided seed script to populate test data:
```bash
pnpm prisma db seed
```

### API Testing Tools
- **Postman** - API testing and documentation
- **Insomnia** - REST API client
- **Thunder Client** - VS Code extension
- **cURL** - Command line testing

## 📚 Additional Resources

- [Main README](./README.md) - Project overview and setup
- [Roles Documentation](./ROLES_README.md) - Role-based access control
- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Database Schema](./prisma/schema.prisma) - Database structure
- [Prisma Documentation](https://www.prisma.io/docs) - Database ORM docs

---

*This API documentation covers all current endpoints and will be updated as new features are added to the system.*
