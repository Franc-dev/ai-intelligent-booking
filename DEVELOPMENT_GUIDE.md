# Development Guide 🛠️

This guide is for developers who want to contribute to, extend, or understand the AI Booking Agent codebase.

## 🏗️ Codebase Architecture

### **Frontend Architecture**
The application uses Next.js 15 with the App Router pattern:

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Landing page
├── globals.css             # Global styles
├── auth/                   # Authentication pages
├── booking/                # AI booking interface
├── dashboard/              # User dashboard
├── counselor/              # Counselor dashboard
├── admin/                  # Admin pages
├── profile/                # Profile management
└── api/                    # API routes
```

### **Component Architecture**
Components are organized by feature and reusability:

```
components/
├── ui/                     # Reusable UI components (Radix + Tailwind)
├── auth/                   # Authentication components
├── booking/                # Booking-specific components
├── chat/                   # Chat interface components
├── dashboard/              # Dashboard components
├── profile/                # Profile components
└── admin/                  # Admin components
```

### **Library Structure**
Core business logic is separated into utility libraries:

```
lib/
├── auth.ts                 # Authentication utilities
├── booking-tools.ts        # Booking logic and AI integration
├── email-service.ts        # Email functionality
├── meeting-links.ts        # Meeting room management
├── openrouter.ts           # AI API integration
├── prisma.ts               # Database client
└── utils.ts                # General utilities
```

## 🚀 Development Setup

### **Prerequisites**
- Node.js 18+
- pnpm package manager
- PostgreSQL database
- Git

### **Initial Setup**
```bash
# Clone repository
git clone <repository-url>
cd ai-booking-agent

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up database
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed

# Start development server
pnpm dev
```

### **Environment Variables**
```bash
# Required
DATABASE_URL="postgresql://username:password@localhost:5432/ai_booking_agent"
JWT_SECRET="your-super-secret-jwt-key"
OPENROUTER_API_KEY="your-openrouter-api-key"
RESEND_API_KEY="your-resend-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional
NODE_ENV="development"
LOG_LEVEL="debug"
```

## 🔧 Development Workflow

### **Code Style & Standards**
- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended rules
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Standard commit message format

### **File Naming Conventions**
- **Components**: PascalCase (`UserProfile.tsx`)
- **Pages**: kebab-case (`user-profile.tsx`)
- **API Routes**: kebab-case (`user-profile/route.ts`)
- **Utilities**: camelCase (`userProfile.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_SESSIONS`)

### **Component Structure**
```typescript
// components/example/ExampleComponent.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface ExampleComponentProps {
  title: string;
  onAction?: () => void;
}

export function ExampleComponent({ title, onAction }: ExampleComponentProps) {
  const [state, setState] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Component logic
  }, []);

  const handleClick = () => {
    setState(!state);
    onAction?.();
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <Button onClick={handleClick}>
        {state ? 'Active' : 'Inactive'}
      </Button>
    </div>
  );
}
```

## 🗄️ Database Development

### **Schema Changes**
1. **Modify** `prisma/schema.prisma`
2. **Generate** client: `pnpm prisma generate`
3. **Create** migration: `pnpm prisma migrate dev --name description`
4. **Update** seed script if needed
5. **Test** with seed data: `pnpm prisma db seed`

### **Example Schema Addition**
```prisma
// Add new model to schema.prisma
model SessionNote {
  id        String   @id @default(cuid())
  sessionId String
  content   String
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  session Session @relation(fields: [sessionId], references: [id])
  author  User    @relation(fields: [authorId], references: [id])

  @@index([sessionId])
  @@index([authorId])
}
```

### **Database Queries**
Use Prisma Client for all database operations:

```typescript
// lib/example-service.ts
import { prisma } from '@/lib/prisma';

export async function getSessionNotes(sessionId: string) {
  return await prisma.sessionNote.findMany({
    where: { sessionId },
    include: {
      author: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createSessionNote(data: {
  sessionId: string;
  content: string;
  authorId: string;
}) {
  return await prisma.sessionNote.create({
    data,
    include: {
      author: {
        select: { name: true, email: true }
      }
    }
  });
}
```

## 🔌 API Development

### **API Route Structure**
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

// Input validation schema
const CreateNoteSchema = z.object({
  sessionId: z.string().cuid(),
  content: z.string().min(1).max(1000),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Validate input
    const body = await request.json();
    const validatedData = CreateNoteSchema.parse(body);

    // 3. Business logic
    const note = await createSessionNote({
      ...validatedData,
      authorId: session.user.id,
    });

    // 4. Return response
    return NextResponse.json({
      success: true,
      note,
    });

  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### **API Response Standards**
All API responses follow this format:

```typescript
// Success response
{
  success: true,
  data: any,
  message?: string
}

// Error response
{
  success: false,
  error: string,
  details?: any,
  code?: string
}
```

## 🧪 Testing

### **Testing Strategy**
- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Complete user workflows
- **Component Tests**: UI component behavior

### **Test Setup**
```bash
# Install testing dependencies
pnpm add -D jest @testing-library/react @testing-library/jest-dom

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### **Example Test**
```typescript
// __tests__/components/ExampleComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ExampleComponent } from '@/components/example/ExampleComponent';

describe('ExampleComponent', () => {
  it('renders with title', () => {
    render(<ExampleComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('toggles state on button click', () => {
    render(<ExampleComponent title="Test" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Inactive');
    
    fireEvent.click(button);
    expect(button).toHaveTextContent('Active');
  });

  it('calls onAction when button is clicked', () => {
    const mockAction = jest.fn();
    render(<ExampleComponent title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockAction).toHaveBeenCalledTimes(1);
  });
});
```

## 🔐 Authentication & Authorization

### **Role-Based Access Control**
```typescript
// lib/auth.ts
export function requireRole(requiredRole: UserRole) {
  return function (handler: NextApiHandler) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const user = await getCurrentUser(req);
      
      if (!user || user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }
      
      return handler(req, res);
    };
  };
}

// Usage in API route
export const GET = requireRole('ADMIN')(async (req, res) => {
  // Admin-only logic here
});
```

### **Middleware Protection**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Check authentication
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return redirectToLogin(request);
  }
  
  // Verify token and check role-based access
  try {
    const user = verifyToken(token);
    if (!hasAccess(user, pathname)) {
      return redirectToUnauthorized(request);
    }
  } catch {
    return redirectToLogin(request);
  }
  
  return NextResponse.next();
}
```

## 🎨 UI Development

### **Component Design Principles**
- **Composition over inheritance**
- **Props interface for all components**
- **Consistent spacing and typography**
- **Accessibility-first approach**
- **Mobile-responsive design**

### **Styling with Tailwind**
```typescript
// Use consistent spacing scale
const spacing = {
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

// Use semantic color classes
const colors = {
  primary: 'bg-blue-600 text-white',
  secondary: 'bg-gray-200 text-gray-800',
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-yellow-600 text-white',
};

// Responsive design patterns
<div className="
  p-4                    // Base padding
  md:p-6                 // Medium screens and up
  lg:p-8                 // Large screens and up
  grid                   // Grid layout
  grid-cols-1            // Single column on mobile
  md:grid-cols-2         // Two columns on medium screens
  lg:grid-cols-3         // Three columns on large screens
  gap-4                  // Consistent gap
  md:gap-6               // Larger gap on medium screens
">
```

### **Custom Hooks**
```typescript
// hooks/use-local-storage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
```

## 🚀 Performance Optimization

### **Code Splitting**
```typescript
// Lazy load components
const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard'), {
  loading: () => <AdminDashboardSkeleton />,
  ssr: false,
});

// Lazy load pages
const CounselorPage = lazy(() => import('@/app/counselor/page'));

// Suspense boundary
<Suspense fallback={<PageSkeleton />}>
  <CounselorPage />
</Suspense>
```

### **Database Optimization**
```typescript
// Use Prisma select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // Only select needed fields
  },
  where: {
    role: 'COUNSELOR',
    // Add indexes for frequently queried fields
  },
});

// Use pagination for large datasets
const users = await prisma.user.findMany({
  take: 20,
  skip: (page - 1) * 20,
  orderBy: { createdAt: 'desc' },
});
```

### **Caching Strategies**
```typescript
// React Query for server state
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useUsers(page: number) {
  return useQuery({
    queryKey: ['users', page],
    queryFn: () => fetchUsers(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Optimistic updates
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUser,
    onMutate: async (newUser) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['users'] });
      
      // Snapshot previous value
      const previousUsers = queryClient.getQueryData(['users']);
      
      // Optimistically update
      queryClient.setQueryData(['users'], (old: User[]) =>
        old.map(user => user.id === newUser.id ? newUser : user)
      );
      
      return { previousUsers };
    },
    onError: (err, newUser, context) => {
      // Rollback on error
      queryClient.setQueryData(['users'], context?.previousUsers);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

## 🔍 Debugging & Logging

### **Development Logging**
```typescript
// lib/logger.ts
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data);
    }
  },
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error);
    }
    // In production, send to logging service
  },
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, data);
    }
  },
};
```

### **Error Boundaries**
```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Something went wrong
          </h2>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 📦 Building & Deployment

### **Build Process**
```bash
# Development build
pnpm build:dev

# Production build
pnpm build

# Analyze bundle
pnpm build:analyze

# Type checking
pnpm type-check
```

### **Environment Configuration**
```typescript
// lib/config.ts
export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
    cookieDomain: process.env.COOKIE_DOMAIN,
    secure: process.env.NODE_ENV === 'production',
  },
  ai: {
    apiKey: process.env.OPENROUTER_API_KEY!,
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  },
  email: {
    apiKey: process.env.RESEND_API_KEY!,
    fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL!,
    environment: process.env.NODE_ENV || 'development',
  },
} as const;
```

## 🤝 Contributing Guidelines

### **Pull Request Process**
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### **Commit Message Format**
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(booking): add AI-powered counselor matching
fix(auth): resolve magic link expiration issue
docs(api): update endpoint documentation
refactor(ui): extract reusable button component
```

### **Code Review Checklist**
- [ ] Code follows project style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Accessibility considerations are addressed
- [ ] Performance impact is considered

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)

---

*This development guide provides comprehensive information for developers working with the AI Booking Agent codebase. For specific questions or issues, please refer to the project's issue tracker or contact the development team.*
