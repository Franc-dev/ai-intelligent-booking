import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin users
  console.log('👥 Creating admin users...')
  const adminUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@franc-dev.space' },
      update: {},
      create: {
        email: 'admin@franc-dev.space',
        name: 'System Administrator',
      },
    }),
    prisma.user.upsert({
      where: { email: 'franc@franc-dev.space' },
      update: {},
      create: {
        email: 'franc@franc-dev.space',
        name: 'Franc Developer',
      },
    }),
  ])

  console.log(`✅ Created ${adminUsers.length} admin users`)

  // Create counselors with specialties
  console.log('👨‍⚕️ Creating counselors...')
  const counselors = await Promise.all([
    prisma.counselor.upsert({
      where: { email: 'dr.sarah@franc-dev.space' },
      update: {},
      create: {
        name: 'Dr. Sarah Johnson',
        email: 'dr.sarah@franc-dev.space',
        specialties: ['anxiety', 'depression', 'stress-management'],
        bio: 'Licensed clinical psychologist with 8+ years of experience helping clients overcome anxiety, depression, and stress-related challenges. Specializes in cognitive-behavioral therapy and mindfulness techniques.',
        avatar: '/avatars/sarah.jpg',
        isActive: true,
      },
    }),
    prisma.counselor.upsert({
      where: { email: 'dr.michael@franc-dev.space' },
      update: {},
      create: {
        name: 'Dr. Michael Chen',
        email: 'dr.michael@franc-dev.space',
        specialties: ['relationships', 'marriage-counseling', 'communication'],
        bio: 'Relationship therapist with expertise in couples counseling, communication skills, and conflict resolution. Helps partners build stronger, healthier relationships.',
        avatar: '/avatars/michael.jpg',
        isActive: true,
      },
    }),
    prisma.counselor.upsert({
      where: { email: 'dr.emily@franc-dev.space' },
      update: {},
      create: {
        name: 'Dr. Emily Rodriguez',
        email: 'dr.emily@franc-dev.space',
        specialties: ['trauma', 'ptsd', 'grief-counseling'],
        bio: 'Trauma-informed therapist specializing in PTSD, grief, and healing from traumatic experiences. Uses evidence-based approaches including EMDR and trauma-focused CBT.',
        avatar: '/avatars/emily.jpg',
        isActive: true,
      },
    }),
    prisma.counselor.upsert({
      where: { email: 'dr.james@franc-dev.space' },
      update: {},
      create: {
        name: 'Dr. James Wilson',
        email: 'dr.james@franc-dev.space',
        specialties: ['addiction', 'substance-abuse', 'recovery'],
        bio: 'Addiction specialist with extensive experience in substance abuse treatment and recovery support. Provides compassionate care for individuals and families affected by addiction.',
        avatar: '/avatars/james.jpg',
        isActive: true,
      },
    }),
    prisma.counselor.upsert({
      where: { email: 'dr.lisa@franc-dev.space' },
      update: {},
      create: {
        name: 'Dr. Lisa Thompson',
        email: 'dr.lisa@franc-dev.space',
        specialties: ['family-therapy', 'parenting', 'child-adolescent'],
        bio: 'Family therapist specializing in parent-child relationships, adolescent development, and family dynamics. Helps families navigate challenges and build stronger bonds.',
        avatar: '/avatars/lisa.jpg',
        isActive: true,
      },
    }),
  ])

  console.log(`✅ Created ${counselors.length} counselors`)

  // Create counselor availability schedules
  console.log('📅 Creating counselor availability...')
  const availabilityData = []

  for (const counselor of counselors) {
    // Monday to Friday availability
    for (let day = 1; day <= 5; day++) {
      availabilityData.push({
        counselorId: counselor.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC',
        isActive: true,
      })
    }
    // Saturday availability (half day)
    availabilityData.push({
      counselorId: counselor.id,
      dayOfWeek: 6,
      startTime: '09:00',
      endTime: '13:00',
      timezone: 'UTC',
      isActive: true,
    })
  }

  // Clear existing availability and create new
  await prisma.counselorAvailability.deleteMany()
  
  for (const availability of availabilityData) {
    await prisma.counselorAvailability.create({
      data: availability,
    })
  }

  console.log(`✅ Created availability schedules for all counselors`)

  // Create some sample user preferences
  console.log('⚙️ Creating sample user preferences...')
  await prisma.userPreferences.upsert({
    where: { userId: adminUsers[0].id },
    update: {},
    create: {
      userId: adminUsers[0].id,
      preferredTimeSlots: ['morning', 'afternoon'],
      timezone: 'UTC',
      notificationSettings: {
        email: true,
        sms: false,
        reminders: true,
      },
    },
  })

  console.log('✅ Created sample user preferences')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

