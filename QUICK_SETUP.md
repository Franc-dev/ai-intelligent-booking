# 🚀 Quick Setup for AI Booking Agent

## Immediate Fix for "Invalid JSON Response" Error

The error you're seeing is because the OpenRouter API key is not configured. Here's how to fix it in 5 minutes:

### 1. Get Your OpenRouter API Key
- Go to [https://openrouter.ai/](https://openrouter.ai/)
- Sign up or log in
- Go to your API keys section
- Create a new API key

### 2. Create Environment File
Create a file called `.env.local` in your project root (same folder as `package.json`):

```bash
# Database (if you have one set up)
DATABASE_URL="postgresql://username:password@localhost:5432/ai_booking_agent"

# OpenRouter AI API (REQUIRED - this fixes your error)
OPENROUTER_API_KEY="your-actual-api-key-here"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Restart Your Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm dev
```

### 4. Test the Fix
- Go to your chat interface
- Type "hi" or "I want to book a session"
- You should now get proper AI responses instead of errors

## What This Fixes

✅ **"Invalid JSON response" error** - No more HTML error pages  
✅ **AI-powered conversations** - Full booking assistance  
✅ **Intent recognition** - AI understands what users want  
✅ **Smart responses** - Contextual help and guidance  

## Alternative: Use Without AI (Limited Mode)

If you don't want to set up OpenRouter right now, the system will work in limited mode with basic responses. You'll still be able to:
- View the interface
- See basic responses
- Understand how the system works

## Need Help?

- Check the full [SETUP.md](SETUP.md) for detailed instructions
- Review [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for development setup
- The system will show helpful error messages until you configure the API key

## Why This Happened

The AI model `z-ai/glm-4.5-air:free` was returning HTML error pages instead of JSON responses, likely because:
1. The model is no longer available
2. API key was missing
3. Rate limits were exceeded

The fix above resolves all these issues by using reliable models and proper error handling.
