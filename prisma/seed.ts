import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin users
  console.log('👥 Creating admin users...')
  const adminUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'francismwanik254@gmail.com' },
      update: {},
      create: {
        email: 'francismwanik254@gmail.com',
        name: 'System Administrator',
        role: 'ADMIN',
      },
    }),
    prisma.user.upsert({
      where: { email: 'franc@franc-dev.space' },
      update: {},
      create: {
        email: 'franc@franc-dev.space',
        name: 'Franc Developer',
        role: 'ADMIN',
      },
    }),
  ])

  console.log(`✅ Created ${adminUsers.length} admin users`)

  // Create counselor users (these will have both User and Counselor records)
  console.log('👨‍⚕️ Creating counselor users...')
  const counselorUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'francismwaniki630@gmail.com' },
      update: {},
      create: {
        email: 'francismwaniki630@gmail.com',
        name: 'Francis Mwaniki',
        role: 'COUNSELOR',
      },
    }),
    prisma.user.upsert({
      where: { email: 'esoftware385@gmail.com' },
      update: {},
      create: {
        email: 'esoftware385@gmail.com',
        name: 'E-Software Counselor',
        role: 'COUNSELOR',
      },
    }),
    prisma.user.upsert({
      where: { email: 'mwanikifrancis646@gmail.com' },
      update: {},
      create: {
        email: 'mwanikifrancis646@gmail.com',
        name: 'Francis Mwaniki',
        role: 'COUNSELOR',
      },
    }),
    prisma.user.upsert({
      where: { email: 'joykendi826@gmail.com' },
      update: {},
      create: {
        email: 'joykendi826@gmail.com',
        name: 'Joy Kendi',
        role: 'COUNSELOR',
      },
    }),
    prisma.user.upsert({
      where: { email: 'francismwaniki@kabarak.ac.ke' },
      update: {},
      create: {
        email: 'francismwaniki@kabarak.ac.ke',
        name: 'Francis Mwaniki (Kabarak)',
        role: 'COUNSELOR',
      },
    }),
  ])

  console.log(`✅ Created ${counselorUsers.length} counselor users`)

  // Create counselors with specialties
  console.log('👨‍⚕️ Creating counselors...')
  const counselors = await Promise.all([
    prisma.counselor.upsert({
      where: { email: 'francismwaniki630@gmail.com' },
      update: {},
      create: {
        name: 'Francis Mwaniki',
        email: 'francismwaniki630@gmail.com',
        specialties: ['anxiety', 'depression', 'stress-management'],
        bio: 'Licensed clinical psychologist with 8+ years of experience helping clients overcome anxiety, depression, and stress-related challenges. Specializes in cognitive-behavioral therapy and mindfulness techniques.',
        avatar: '/avatars/francis1.jpg',
        isActive: true,
      },
    }),
    prisma.counselor.upsert({
      where: { email: 'esoftware385@gmail.com' },
      update: {},
      create: {
        name: 'E-Software Counselor',
        email: 'esoftware385@gmail.com',
        specialties: ['relationships', 'marriage-counseling', 'communication'],
        bio: 'Relationship therapist with expertise in couples counseling, communication skills, and conflict resolution. Helps partners build stronger, healthier relationships.',
        avatar: '/avatars/esoftware.jpg',
        isActive: true,
      },
    }),
    prisma.counselor.upsert({
      where: { email: 'mwanikifrancis646@gmail.com' },
      update: {},
      create: {
        name: 'Francis Mwaniki',
        email: 'mwanikifrancis646@gmail.com',
        specialties: ['trauma', 'ptsd', 'grief-counseling'],
        bio: 'Trauma-informed therapist specializing in PTSD, grief, and healing from traumatic experiences. Uses evidence-based approaches including EMDR and trauma-focused CBT.',
        avatar: '/avatars/francis2.jpg',
        isActive: true,
      },
    }),
    prisma.counselor.upsert({
      where: { email: 'joykendi826@gmail.com' },
      update: {},
      create: {
        name: 'Joy Kendi',
        email: 'joykendi826@gmail.com',
        specialties: ['addiction', 'substance-abuse', 'recovery'],
        bio: 'Addiction specialist with extensive experience in substance abuse treatment and recovery support. Provides compassionate care for individuals and families affected by addiction.',
        avatar: '/avatars/joy.jpg',
        isActive: true,
      },
    }),
    prisma.counselor.upsert({
      where: { email: 'francismwaniki@kabarak.ac.ke' },
      update: {},
      create: {
        name: 'Francis Mwaniki (Kabarak)',
        email: 'francismwaniki@kabarak.ac.ke',
        specialties: ['family-therapy', 'parenting', 'child-adolescent'],
        bio: 'Family therapist specializing in parent-child relationships, adolescent development, and family dynamics. Helps families navigate challenges and build stronger bonds.',
        avatar: '/avatars/francis3.jpg',
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

