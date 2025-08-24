# Role-Based Authentication System

This system now supports three user roles: **USER**, **COUNSELOR**, and **ADMIN**.

## 🔐 User Roles

### **USER** (Default Role)
- Regular users who can book counseling sessions
- Access to: Dashboard, Booking, Profile
- Can view their own bookings and preferences

### **COUNSELOR**
- Professional counselors who provide sessions
- Access to: Counselor Dashboard, Sessions, Clients, Profile
- Can view their scheduled sessions and client information
- Can manage their availability and specialties

### **ADMIN**
- System administrators with full access
- Access to: Dashboard, Meeting Links, Users, Counselors, Profile
- Can manage all users, counselors, and system settings
- Can view meeting room status and statistics

## 🚀 Getting Started

### 1. Database Setup
First, you need to run the database migration to add the role field:

```bash
# Run the migration
pnpm prisma migrate dev --name add-user-roles

# Seed the database with sample users
pnpm prisma db seed
```

### 2. Login Credentials

After seeding, you can login with these accounts:

#### **Admin Users**
- **Email:** `francismwanik254@gmail.com`
- **Role:** ADMIN
- **Access:** Full system access

- **Email:** `franc@franc-dev.space`
- **Role:** ADMIN
- **Access:** Full system access

#### **Counselor Users**
- **Email:** `francismwaniki630@gmail.com`
- **Role:** COUNSELOR
- **Access:** Counselor dashboard and session management

- **Email:** `esoftware385@gmail.com`
- **Role:** COUNSELOR
- **Access:** Counselor dashboard and session management

- **Email:** `mwanikifrancis646@gmail.com`
- **Role:** COUNSELOR
- **Access:** Counselor dashboard and session management

- **Email:** `joykendi826@gmail.com`
- **Role:** COUNSELOR
- **Access:** Counselor dashboard and session management

- **Email:** `francismwaniki@kabarak.ac.ke`
- **Role:** COUNSELOR
- **Access:** Counselor dashboard and session management

## 📱 Available Pages

### **Landing Page**
- `/` - Main landing page with role-based navigation and information
- `/login` - Login page with magic link authentication

### **For Regular Users**
- `/dashboard` - User dashboard with bookings and stats
- `/booking` - AI-powered booking system
- `/profile` - User preferences and settings

### **For Counselors**
- `/counselor` - Counselor dashboard with sessions
- `/counselor/sessions` - Session management (coming soon)
- `/counselor/clients` - Client management (coming soon)
- `/profile` - Counselor profile and settings

### **For Admins**
- `/dashboard` - Admin overview dashboard
- `/admin/meeting-links` - Meeting room management
- `/admin/users` - User management and role assignment
- `/admin/counselors` - Counselor management
- `/profile` - Admin profile and settings

## 🔒 Security Features

- **Role-based access control** - Users can only access pages appropriate for their role
- **Automatic role-based redirection** - Users are automatically redirected to their role-appropriate dashboard after login
- **Route protection** - Middleware prevents admins and counselors from accessing user-only pages
- **Page-level security** - Each page checks user role and redirects unauthorized access
- **Protected routes** - Middleware automatically redirects unauthorized access
- **API protection** - Admin endpoints check for proper role permissions
- **Session validation** - All protected routes verify user authentication

## 🛠️ Adding New Users

### **Via Database Seed**
Edit `prisma/seed.ts` to add new users with specific roles:

```typescript
prisma.user.upsert({
  where: { email: 'newuser@example.com' },
  update: {},
  create: {
    email: 'newuser@example.com',
    name: 'New User',
    role: 'COUNSELOR', // or 'ADMIN' or 'USER'
  },
})
```

### **Via API** (Coming Soon)
Future versions will include admin APIs to create and manage users.

## 🔄 Role Management

### **Changing User Roles**
Currently, user roles can only be changed via database updates. Future versions will include admin interfaces for role management.

### **Role Hierarchy**
- **ADMIN** can access everything
- **COUNSELOR** can access counselor features + user features
- **USER** can only access user features

## 🚨 Troubleshooting

### **"Access Denied" Errors**
- Ensure the user has the correct role in the database
- Check that the role field was properly added via migration
- Verify the user is logged in with a valid session

### **Missing Navigation Items**
- Navigation automatically adjusts based on user role
- If items are missing, check the user's role in the database
- Ensure the navigation component is receiving the correct role prop

### **Database Errors**
- Run `pnpm prisma generate` after schema changes
- Ensure the migration was successful: `pnpm prisma migrate status`
- Check database connection and environment variables

## 🔮 Future Enhancements

- **Role editing interface** for admins
- **Permission-based access control** for fine-grained permissions
- **Audit logging** for role changes and access attempts
- **Multi-role support** for users with multiple responsibilities
- **Role-based email templates** and notifications

## 📞 Support

If you encounter issues with the role system:
1. Check the database migration status
2. Verify user roles in the database
3. Check browser console for client-side errors
4. Review server logs for authentication errors
