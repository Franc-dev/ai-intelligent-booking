# Database Seeding

This project includes a comprehensive seed script to populate the database with sample data for development and testing.

## What Gets Created

### Admin Users
- `admin@franc-dev.space` - System Administrator
- `franc@franc-dev.space` - Franc Developer

### Counselors
- **Dr. Sarah Johnson** - Anxiety, Depression, Stress Management
- **Dr. Michael Chen** - Relationships, Marriage Counseling, Communication
- **Dr. Emily Rodriguez** - Trauma, PTSD, Grief Counseling
- **Dr. James Wilson** - Addiction, Substance Abuse, Recovery
- **Dr. Lisa Thompson** - Family Therapy, Parenting, Child/Adolescent

### Availability Schedules
- Monday-Friday: 9:00 AM - 5:00 PM
- Saturday: 9:00 AM - 1:00 PM
- All times in UTC

## Running the Seed Script

### Option 1: Using the npm script
```bash
pnpm run db:seed
```

### Option 2: Direct Prisma command
```bash
npx prisma db seed
```

### Option 3: Manual execution
```bash
npx tsx prisma/seed.ts
```

## Prerequisites

1. **Database Setup**: Ensure your database is running and accessible
2. **Environment Variables**: Set your `DATABASE_URL` in `.env`
3. **Dependencies**: Install all packages with `pnpm install`

## Resetting and Re-seeding

To start fresh and re-seed the database:

```bash
# Reset the database (WARNING: This will delete all data)
npx prisma migrate reset

# Or manually seed after clearing
npx prisma db seed
```

## Customization

Edit `prisma/seed.ts` to:
- Add more counselors
- Modify specialties
- Change availability schedules
- Add sample bookings
- Customize user preferences

## Notes

- The seed script uses `upsert` operations, so it's safe to run multiple times
- All counselors use the `franc-dev.space` domain for consistency
- Availability schedules are set to UTC timezone by default
- The script includes realistic counselor bios and specialties

